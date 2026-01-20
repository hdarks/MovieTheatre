import mongoose from "mongoose";

const { Schema, model } = mongoose;

const auditSchema = new Schema({
    entity: { type: String, enum: ["booking", "inventory", "showtime", "movie"], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    byUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now },
    meta: { type: Schema.Types.Mixed }
});

auditSchema.index({ entity: 1, entityId: 1, at: -1 });

const Audit = model('Audit', auditSchema);
export default Audit;