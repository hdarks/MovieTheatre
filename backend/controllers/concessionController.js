import Concession from "../model/Concessions.js";
import { logAudit } from "../utils/auditLogger.js";

export const createConcession = async (req, res) => {
    try {
        const { name, category, price, stock, active } = req.body;

        if (!name || !category || price == null || active == null) {
            return res.status(400).json({ error: "Name, category, price and active are required." });
        }
        const concession = new Concession({
            name: name.trim(),
            category,
            price: Number(price),
            stock: stock != null ? Number(stock) : 0,
            active
        });
        await concession.save();
        await logAudit({
            entity: "inventory",
            entityId: concession._id,
            action: "create",
            byUserId: req.user?.id,
            meta: req.body
        });

        res.status(201).json(concession);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getConcession = async (req, res) => {
    try {
        const concession = await Concession.find().sort({ category: 1, name: 1 });
        res.json(concession);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getConcessionById = async (req, res) => {
    try {
        const concession = await Concession.findById(req.params.id);
        if (!concession) return res.status(404).json({ error: "Concession not found" });
        res.json(concession);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateConcession = async (req, res) => {
    try {
        const { name, category, price, stock, active } = req.body;
        const concession = await Concession.findByIdAndUpdate(
            req.params.id,
            { name, category, price, stock, active },
            { new: true, runValidators: true }
        );
        if (!concession) return res.status(404).json({ error: "Concession not found" });
        await logAudit({
            entity: "inventory",
            entityId: concession._id,
            action: "update",
            byUserId: req.user?.id,
            meta: req.body
        });
        res.status(201).json(concession);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const adjustStock = async (req, res) => {
    try {
        const { delta } = req.body;
        const concession = await Concession.findById(req.params.id);
        if (!concession) return res.status(404).json({ error: "Concession not found" });

        concession.stock = Math.max(0, concession.stock + Number(delta));
        await concession.save();

        await logAudit({
            entity: "inventory",
            entityId: concession._id,
            action: "adjustStock",
            byUserId: req.user?.id,
            meta: { delta }
        });
        res.json(concession);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteConcession = async (req, res) => {
    try {
        const concession = await Concession.findByIdAndDelete(req.params.id);
        if (!concession) return res.status(404).json({ error: "Concession not found" });
        await logAudit({
            entity: "inventory",
            entityId: concession._id,
            action: "delete",
            byUserId: req.user?.id,
        });
        res.json({ message: "Concession deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};