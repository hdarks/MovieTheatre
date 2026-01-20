import Showtime from "../model/Showtime.js";
import Theatre from "../model/Theatre.js";
import Booking from "../model/Booking.js";
import { logAudit } from "../utils/auditLogger.js";

const hasConflict = async (theatreId, screenId, startTime, endTime, excludeId = null) => {
    const filter = {
        theatreId,
        screenId,
        status: "scheduled",
        $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }]
    };
    if (excludeId) filter._id = { $ne: excludeId };
    const count = await Showtime.countDocuments(filter);
    return count > 0;
};

export const createShowtime = async (req, res) => {
    try {
        const { movieId, theatreId, screenId, startTime, endTime, language, format, basePrice, pricingRules } = req.body;

        const theatre = await Theatre.findById(theatreId);
        if (!theatre) return res.status(404).json({ error: "Theatre not found" });
        if (!theatre.screens.some(s => s.screenId === screenId)) {
            return res.status(404).json({ error: "Screen not found in theatre" });
        }

        if (await hasConflict(theatreId, screenId, new Date(startTime), new Date(endTime))) {
            return res.status(409).json({ error: "Showtime conflicts with existing schedule" });
        }
        const showtime = new Showtime({
            movieId, theatreId, screenId, startTime, endTime,
            language, format, basePrice, pricingRules: pricingRules || []
        });

        await showtime.save();
        await logAudit({
            entity: "showtime",
            entityId: showtime._id,
            action: "createShowtime",
            byUserId: req.user.id,
            meta: req.body
        });
        res.status(201).json(showtime);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getShowtimes = async (req, res) => {
    try {
        const { movieId, theatreId, date } = req.query;
        const filter = { status: "scheduled" };
        if (movieId) filter.movieId = movieId;
        if (theatreId) filter.theatreId = theatreId;
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.startTime = { $gte: start, $lte: end };
        }

        const showtimes = await Showtime.find(filter)
            .sort({ startTime: 1 })
            .populate("movieId", "title")
            .populate("theatreId", "name");
        res.json(showtimes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getShowtimeById = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });
        res.json(showtime);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateShowtime = async (req, res) => {
    try {
        const { startTime, endTime, screenId, theatreId } = req.body;
        const existing = await Showtime.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: "Showtime not found" });

        const newTheatreId = theatreId || existing.theatreId;
        const newScreenId = screenId || existing.screenId;
        const newStart = startTime ? new Date(startTime) : existing.startTime;
        const newEnd = endTime ? new Date(endTime) : existing.endTime;

        if (await hasConflict(newTheatreId, newScreenId, newStart, newEnd, existing._id)) {
            return res.status(409).json({ error: "Updated showtime conflicts with schedule" });
        }

        const updated = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await logAudit({
            entity: "showtime",
            entityId: updated._id,
            action: "updateShowtime",
            byUserId: req.user.id,
            meta: req.body
        });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const cancelShowtime = async (req, res) => {
    try {
        const st = await Showtime.findById(req.params.id);
        if (!st) return res.status(404).json({ error: "Showtime not found" });
        st.status = "cancelled";
        await st.save();
        await logAudit({
            entity: "showtime",
            entityId: st._id,
            action: "cancelShowtime",
            byUserId: req.user.id,
        });
        res.json(st);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSeatmap = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });

        const now = new Date();
        showtime.lockedSeats = showtime.lockedSeats.filter(ls => ls.expiresAt > now);
        await showtime.save();

        const theatre = await Theatre.findById(showtime.theatreId);
        if (!theatre) return res.status(404).json({ error: "Theatre not found" });

        const screen = theatre.screens.find(s => s.screenId === showtime.screenId);
        if (!screen) return res.status(404).json({ error: "Screen not found in theatre." });

        const bookings = await Booking.find({
            showtimeId: showtime._id,
            status: { $in: ["pending", "confirmed"] }
        }).select("seats");

        const bookedSet = new Set(bookings.flatMap((b) => b.seats.map((s) => s.seatKey)));
        res.json({
            rows: screen.layout.rows,
            cols: screen.layout.cols,
            seats: screen.layout.seats,
            lockedSeats: showtime.lockedSeats.map((ls) => ls.seatKey),
            bookedSeats: Array.from(bookedSet)
        });
    } catch (err) {
        console.error("Error in getSeatmap:", err);
        res.status(500).json({ error: "Failed to fetch Seat map" });
    }
};

export const lockSeats = async (req, res) => {
    try {
        const { seatKeys, sessionId, ttlSeconds = 300 } = req.body;
        const st = await Showtime.findById(req.params.id);
        if (!st) return res.status(404).json({ error: "Showtime not found" });

        const now = new Date();
        st.lockedSeats = st.lockedSeats.filter(ls => ls.expiresAt.getTime() > now);

        const existingLocks = new Set(st.lockedSeats.map(ls => ls.seatKey));
        const bookings = await Booking.find({ showtimeId: st._id, status: { $in: ["pending", "confirmed"] } }).select("seats");
        const bookedSet = new Set(bookings.flatMap(b => b.seats.map(s => s.seatKey)));

        const requested = Array.isArray(seatKeys) ? seatKeys : [];
        const unavailable = requested.filter(k => existingLocks.has(k) || bookedSet.has(k));
        if (unavailable.length) {
            return res.status(404).json({ error: "Some seats are available", seats: unavailable });
        }

        const expiresAt = new Date(now + ttlSeconds * 1000);
        for (const k of requested) {
            st.lockedSeats.push({ seatKey: k, bySessionId: sessionId, expiresAt });
        }

        await st.save();
        res.status(201).json({ lockedSeats: st.lockedSeats.filter(ls => requested.includes(ls.seatKey)) });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const releaseLocks = async (req, res) => {
    try {
        const { sessionId, seatKeys } = req.body;
        const st = await Showtime.findById(req.params.id);
        if (!st) return res.status(404).json({ error: "Showtime not found" });
        const keysSet = seatKeys ? new Set(seatKeys) : null;
        st.lockedSeats = st.lockedSeats.filter(ls => {
            const sameSession = ls.bySessionId === sessionId;
            const targeted = keysSet ? keysSet.has(ls.seatKey) : true;
            return !(sameSession && targeted);
        });
        await st.save();
        res.json({ message: "Locks released" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};