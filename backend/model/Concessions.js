import mongoose from "mongoose";

const { Schema, model } = mongoose;

const concessionSchema = new Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ["food", "drink", "merch"], required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, required: true },
}, { timestamps: true });

concessionSchema.index({ category: 1, active: 1 });

const Concession = model('Concession', concessionSchema);
export default Concession;