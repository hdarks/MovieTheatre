import Audit from "../model/Audit.js";

export const getAudits = async (req, res) => {
    try {
        const { entity, entityId } = req.query;
        const filter = {};
        if (entity) filter.entity = entity;
        if (entityId) filter.entityId = entityId;

        const audits = await Audit.find(filter).sort({ at: -1 });
        res.json(audits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAuditById = async (req, res) => {
    try {
        const audit = await Audit.findById(req.params.id);
        if (!audit) return res.status(404).json({ error: "Audit not found" });
        res.json(audit);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};