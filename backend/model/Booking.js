import mongoose from "mongoose";

const { Schema, model } = mongoose;

const seatSchema = new Schema({
    seatKey: { type: String, required: true },
    pricePaid: { type: Number, required: true, min: 0 },
}, { _id: false });

const paymentSchema = new Schema({
    provider: { type: String, enum: ["mock", "razorpay", "stripe"], required: true },
    intentId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    captured: { type: Boolean, default: false },
}, { _id: false });

const bookingSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    showtimeId: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true },
    seats: { type: [seatSchema], required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "refunded"], default: "pending" },
    payment: { type: paymentSchema, required: true },
    qrCode: { type: String, required: true },
    sessionId: { type: String, required: true }
}, { timestamps: true });

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ showtimeId: 1 });

const Booking = model('Booking', bookingSchema);
export default Booking;