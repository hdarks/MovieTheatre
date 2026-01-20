import mongoose from "mongoose";

const { Schema, model } = mongoose;

const pricingRuleSchema = new Schema({
    ruleId: { type: String, required: true },
    type: { type: String, enum: ["timeBased", "seatType", "promo"], required: true },
    value: { type: Number, required: true },
    op: { type: String, enum: ["add", "mul"], required: true }
}, { _id: false });

const lockedSeatSchema = new Schema({
    seatKey: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    bySessionId: { type: String, required: true }
}, { _id: false });

const showtimeSchema = new Schema({
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatreId: { type: Schema.Types.ObjectId, ref: 'Theatre', required: true },
    screenId: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    language: { type: String, required: true },
    format: { type: String, enum: ["2D", "3D", "IMAX"], required: true },
    basePrice: { type: Number, required: true, min: 0 },
    pricingRules: { type: [pricingRuleSchema], default: [] },
    status: { type: String, enum: ["scheduled", "cancelled"], default: "scheduled" },
    lockedSeats: { type: [lockedSeatSchema], default: [] }
}, { timestamps: { createdAt: true, updatedAt: true } });

showtimeSchema.index({ theatreId: 1, startTime: 1 });
showtimeSchema.index({ movieId: 1, startTime: 1 });

const Showtime = model('Showtime', showtimeSchema);
export default Showtime;