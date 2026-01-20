import Audit from "../model/Audit.js";

export const logAudit = async ({ entity, entityId, action, byUserId, meta = {} }) => {
    try {
        await Audit.create({
            entity,
            entityId,
            action,
            byUserId,
            at: new Date(),
            meta
        });
    } catch (err) {
        console.error("Failed to log Audit", err.message);
    }
};