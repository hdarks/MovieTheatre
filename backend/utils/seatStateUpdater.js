import { io } from "../server.js";

export const updatSeatStates = async (showtime, booking, action) => {
    const seatKeys = booking.seats.map(s => s.seatKey);
    const seatKeySet = new Set(seatKeys);

    switch (action) {
        case "create":
            showtime.lockedSeats = showtime.lockedSeats.filter(ls => !seatKeySet.has(ls.seatKey));
            showtime.bookedSeats.push(...seatKeys.map(k => ({ seatKey: k })));
            await showtime.save();
            seatKeys.forEach(k => io.of("/showtimes").to(showtime._id.toString()).emit("seatPending", k));
            break;
        case "confirm":
            showtime.lockedSeats = showtime.lockedSeats.filter(ls => !seatKeySet.has(ls.seatKey));
            showtime.bookedSeats.push(...seatKeys.map(k => ({ seatKey: k })));
            await showtime.save();
            seatKeys.forEach(k => io.of("/showtimes").to(showtime._id.toString()).emit("seatConfirmed", k));
            break;
        case "cancel":
            showtime.lockedSeats = showtime.lockedSeats.filter(ls => !seatKeySet.has(ls.seatKey));
            showtime.bookedSeats = showtime.bookedSeats.filter(bs => !seatKeySet.has(bs.seatKey));
            await showtime.save();
            seatKeys.forEach(k => io.of("/showtimes").to(showtime._id.toString()).emit("seatUnlocked", k));
            break;
        case "refund":
            showtime.bookedSeats = showtime.bookedSeats.filter(bs => !seatKeySet.has(bs.seatKey));
            await showtime.save();
            seatKeys.forEach(k => io.of("/showtimes").to(showtime._id.toString()).emit("seatUnlocked", k));
            break;
        default:
            throw new Error(`Unknown seat state action: ${action}`);
    }
};