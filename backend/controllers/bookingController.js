import Booking from "../model/Booking.js";
import Showtime from "../model/Showtime.js";
import { v4 as uuidv4 } from "uuid";
import { logAudit } from "../utils/auditLogger.js";
import { updatSeatStates } from "../utils/seatStateUpdater.js";

export const createBooking = async (req, res) => {
    try {
        const { showtimeId, seats, payment, sessionId } = req.body;
        const userId = req.user.id;

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime || showtime.status !== "scheduled") {
            return res.status(404).json({ error: "Showtime not available" });
        }
        const now = new Date();
        const unavailable = seats.filter(s => !showtime.lockedSeats.some(
            ls => ls.seatKey === s.seatKey &&
                ls.bySessionId === sessionId &&
                ls.expiresAt > now
        ));
        if (unavailable.length) {
            return res.status(409).json({ error: "Seat not locked by this session.", seats: unavailable });
        }

        const booking = new Booking({
            userId,
            showtimeId,
            seats,
            status: "pending",
            payment,
            qrCode: uuidv4(),
            sessionId
        });
        await booking.save();
        await updatSeatStates(showtime, booking, "create");
        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const confirmBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        booking.status = "confirmed";
        booking.payment.captured = true;
        await booking.save();

        const showtime = await Showtime.findById(booking.showtimeId);
        if (showtime) {
            await updateSeatState(showtime, booking, "confirm");
        }
        await logAudit({
            entity: "booking",
            entityId: booking._id,
            action: "confirmBooking",
            byUserId: req.user.id,
            meta: { payment: booking.payment }
        });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        booking.status = "cancelled";
        await booking.save();

        const showtime = await Showtime.findById(booking.showtimeId);
        if (showtime) {
            await updateSeatState(showtime, booking, "cancel");
        }
        await logAudit({
            entity: "booking",
            entityId: booking._id,
            action: "cancelBooking",
            byUserId: req.user.id,
        });
        res.json({ message: "Booking cancelled", booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const refundBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        if (booking.status !== "cancelled") {
            return res.json({ message: "Only cancelled bookings can be refunded." });
        }

        booking.status = "refunded";
        await booking.save();

        const showtime = await Showtime.findById(booking.showtimeId);
        if (showtime) {
            await updateSeatState(showtime, booking, "refund");
        }
        await logAudit({
            entity: "booking",
            entityId: booking._id,
            action: "refundBooking",
            byUserId: req.user.id
        });
        res.json({ message: "Booking Refunded", booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const validateTicket = async (req, res) => {
    try {
        const { qrCode } = req.body;
        const booking = await Booking.findOne({ qrCode, status: "confirmed" });
        if (!booking) return res.status(404).json({ error: "Invalid or unused ticket" });
        res.json({ valid: true, booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("showtimeId", "startTime")
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};