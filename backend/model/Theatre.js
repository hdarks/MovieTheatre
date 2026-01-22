import mongoose from "mongoose";

const { Schema, model } = mongoose;

const seatSchema = new Schema({
    row: { type: String, required: true },
    col: { type: Number, required: true },
    type: { type: String, enum: ["standard", "vip", "accessible"], default: "standard" }
}, { _id: false });

const layoutSchema = new Schema({
    rows: { type: Number, required: true },
    cols: { type: Number, required: true },
    seats: { type: [seatSchema], default: [] }
}, { _id: false });

const screenSchema = new Schema({
    name: { type: String, required: true },
    layout: { type: layoutSchema, required: true }
});

const theatreSchema = new Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    screens: { type: [screenSchema], default: [] }
}, { timestamps: true });

theatreSchema.index({ name: 1 });

const Theatre = model('Theatre', theatreSchema);
export default Theatre;