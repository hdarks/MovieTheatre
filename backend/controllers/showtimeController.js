import Showtime from "../model/Showtime.js";
import Theatre from "../model/Theatre.js";
import Booking from "../model/Booking.js";
import { logAudit } from "../utils/auditLogger.js";
import { io } from "../server.js";

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

        const screen = theatre.screens.id(screenId);
        if (!screen) {
            return res.status(404).json({ error: "Screen not found in theatre" });
        }

        if (await hasConflict(theatreId, screen._id, new Date(startTime), new Date(endTime))) {
            return res.status(409).json({ error: "Showtime conflicts with existing schedule" });
        }
        const showtime = new Showtime({
            movieId, theatreId, screenId: screen._id, startTime, endTime,
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
        const showtime = await Showtime.findById(req.params.id)
            .populate("movieId", "title")
            .populate("theatreId", "name");
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

        const screen = theatre.screens.id(showtime.screenId);
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
            bookedSeats: Array.from(bookedSet),
            basePrice: showtime.basePrice,
            pricingRules: showtime.pricingRules,
            showtime
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

        const requested = Array.isArray(seatKeys)
            ? [...new Set(seatKeys.map(k => {
                if (typeof k === "string") return k;
                if (typeof k === "object" && k.row && k.col) return `${k.row}${k.col}`;
                return String(k);
            }))]
            : [];

        const existingLocks = st.lockedSeats;
        const bookings = await Booking.find({ showtimeId: st._id, status: { $in: ["pending", "confirmed"] } }).select("seats");
        const bookedSet = new Set(bookings.flatMap(b => b.seats.map(s => s.seatKey)));
        const unavailable = requested.filter(k => {
            const lock = existingLocks.find(ls => ls.seatKey === k);
            return (lock && lock.bySessionId !== sessionId) || bookedSet.has(k);
        });
        if (unavailable.length) {
            return res.status(409).json({ error: "Some seats are unavailable", seats: unavailable });
        }

        const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
        for (const k of requested) {
            st.lockedSeats = st.lockedSeats.filter(ls => !(ls.seatKey === k && ls.bySessionId === sessionId));
            st.lockedSeats.push({ seatKey: k, bySessionId: sessionId, expiresAt });
        }
        st.markModified("lockedSeats");
        console.log("Before save: ", st.lockedSeats);
        await st.save();
        console.log("After save: ", st.lockedSeats);
        const locked = st.lockedSeats.filter(ls => requested.includes(ls.seatKey) && ls.bySessionId === sessionId);
        requested.forEach(seatKey => {
            io.of("/showtimes").to(st._id.toString()).emit("seatLocked", seatKey);
        });
        res.status(201).json({ lockedSeats: locked });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const releaseLocks = async (req, res) => {
    try {
        const { sessionId, seatKeys } = req.body;
        const st = await Showtime.findById(req.params.id);
        if (!st) return res.status(404).json({ error: "Showtime not found" });

        const normalizedKeys = Array.isArray(seatKeys)
            ? seatKeys.map(k => {
                if (typeof k === "string") return k;
                if (typeof k === "object" && k.row && k.col) return `${k.row}${k.col}`;
                return String(k);
            })
            : [];
        const keysSet = normalizedKeys.length ? new Set(normalizedKeys) : null;
        const releasedSeats = [];
        st.lockedSeats = st.lockedSeats.filter(ls => {
            const sameSession = ls.bySessionId === sessionId;
            const targeted = keysSet ? keysSet.has(ls.seatKey) : true;
            if (sameSession && targeted) {
                releasedSeats.push(ls.seatKey);
                return false;
            }
            return true;
        });
        await st.save();
        releasedSeats.forEach(seatKey => {
            io.of("/showtimes").to(st._id.toString()).emit("seatUnlocked", seatKey);
        });
        res.json({ message: "Locks released", releasedSeats });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};