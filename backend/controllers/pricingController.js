import Showtime from "../model/Showtime.js";

export const addPricingRule = async (req, res) => {
    try {
        const { showtimeId } = req.params;
        const { ruleId, type, value, op } = req.body;

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });

        showtime.pricingRules.push({ ruleId, type, value, op });
        await showtime.save();

        res.status(201).json({ message: "Pricing rule added", pricingRules: showtime.pricingRules });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPricingRules = async (req, res) => {
    try {
        const { showtimeId } = req.params;
        const showtime = await Showtime.findById(showtimeId).select("pricingRules");
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });

        res.json(showtime.pricingRules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updatePricingRule = async (req, res) => {
    try {
        const { showtimeId, ruleId } = req.params;
        const { type, value, op } = req.body;

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });

        const rule = showtime.pricingRules.find((r) => r.ruleId === ruleId);
        if (!rule) return res.status(404).json({ error: "Rule not found" });

        if (type) rule.type = type;
        if (value !== undefined) rule.value = value;
        if (op) rule.op = op;

        await showtime.save();
        res.json({ message: "Pricing rule updated", pricingRules: showtime.pricingRules });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deletePricingRule = async (req, res) => {
    try {
        const { showtimeId, ruleId } = req.params;

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) return res.status(404).json({ error: "Showtime not found" });

        showtime.pricingRules = showtime.pricingRules.filter((r) => r.ruleId !== ruleId);
        await showtime.save();

        res.json({ message: "Pricing rule deleted", pricingRules: showtime.pricingRules });
    } catch (err) {
        res.status(500).json({ error: Error.message });
    }
};