import Booking from "../model/Booking.js";
import Showtime from "../model/Showtime.js";
import { v4 as uuidv4 } from "uuid";
import { logAudit } from "../utils/auditLogger.js";
import { io } from "../server.js";

export const createBooking = async (req, res) => {
    try {
        const { showtimeId, seats, payment } = req.body;
        const userId = req.user.id;

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime || showtime.status !== "scheduled") {
            return res.status(404).json({ error: "Showtime not available" });
        }

        const now = new Date();
        const lockedSet = new Set(showtime.lockedSeats.filter(ls => ls.expiresAt > now).map(ls => ls.seatKey));
        const requested = seats.map(s => s.seatKey);
        const unavailable = requested.filter(k => !lockedSet.has(k));
        if (unavailable.length) {
            return res.status(409).json({ error: "Seat not locked", seats: unavailable });
        }

        const booking = new Booking({
            userId,
            showtimeId,
            seats,
            status: "pending",
            payment,
            qrCode: uuidv4()
        });

        await booking.save();
        seats.forEach((s) => {
            io.of("/showtimes").to(showtimeId).emit("seatBooked", s.seatKey);
        });
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
            const bookedKeys = new Set(booking.seats.map(s => s.seatKey));
            showtime.lockedSeats = showtime.lockedSeats.filter(ls => !bookedKeys.has(ls.seatKey));
            await showtime.save();

            booking.seats.forEach((s) => {
                io.of("/showtimes").to(showtime._id.toString()).emit("seatBooked", s.seatKey);
            });
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

        booking.seatsforEach((s) => {
            io.of("/showtimes").to(booking.showtimeId.toString()).emit("seatCancelled", s.seatKey);
        });
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
            .populate("showtimeId", "movieTitle startTime")
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
}