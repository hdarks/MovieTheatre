import Theatre from "../model/Theatre.js";
import { logAudit } from "../utils/auditLogger.js";

export const createTheatre = async (req, res) => {
    try {
        const theatre = new Theatre(req.body);
        await theatre.save();
        await logAudit({
            entity: "inventory",
            entityId: theatre._id,
            action: "createTheatre",
            byUserId: req.user.id,
            meta: req.body
        });
        res.status(201).json(theatre);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getTheatres = async (req, res) => {
    try {
        const theatres = await Theatre.find().sort({ createdAt: -1 });
        res.json(theatres);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTheatreById = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) return res.status(404).json({ error: "Theatre not found" });
        res.json(theatre);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const addScreen = async (req, res) => {
    try {
        const { screenId, name, layout } = req.body;
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) return res.status(404).json({ error: "Theatre not found" });

        if (theatre.screens.some(s => s.screenId === screenId)) {
            return res.status(404).json({ error: "Screen ID already exists in Theatre" });
        }

        theatre.screens.push({ screenId, name, layout });
        await theatre.save();
        await logAudit({
            entity: "inventory",
            entityId: screenId,
            action: "addScreen",
            byUserId: req.user.id,
            meta: req.body
        });
        res.status(201).json(theatre);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updateScreenLayout = async (req, res) => {
    try {
        const { screenId } = req.params;
        const { layout, name } = req.body;

        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) return res.status(404).json({ error: "Theatre not found" });

        const screen = theatre.screens.find(s => s.screenId === screenId);
        if (!screen) return res.status(404).json({ error: "Screen not found" });

        if (layout) screen.layout = layout;
        if (layout?.seats) {
            const validRows = layout.rows;
            const validCols = layout.cols;

            const invalidSeats = layout.seats.filter(
                (s) =>
                    typeof s.row !== "string" ||
                    typeof s.col !== "number" ||
                    s.col < 1 || s.col > validCols ||
                    s.row.charCodeAt(0) - 65 >= validRows
            );
            if (invalidSeats.length > 0) {
                return res.status(400).json({ error: "Invalid seat cordinates in Layout" });
            }
        }
        if (name) screen.name = name;

        await theatre.save();
        await logAudit({
            entity: "inventory",
            entityId: screen._id,
            action: "updateScreen",
            byUserId: req.user.id,
            meta: req.body
        });
        res.json(theatre);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const removeScreen = async (req, res) => {
    try {
        const { screenId } = req.params;
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) return res.status(404).json({ error: "Theater not found" });

        const removedScreen = theatre.screens.find(s => s.screenId === screenId);
        if (!removedScreen) return res.status(404).json({ error: "Screen not found" });
        theatre.screens = theatre.screens.filter(s => s.screenId !== screenId);
        // if (theatre.screens.length === before) {
        //     return res.status(404).json({ error: "Screen not found" });
        // }

        await theatre.save();
        await logAudit({
            entity: "inventory",
            entityId: removedScreen._id,
            action: "removeScreen",
            byUserId: req.user.id,
        });
        res.json({ message: "Screen removed", theatre });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!theatre) return res.sta(404).json({ error: "Theatre not found" });
        await logAudit({
            entity: "inventory",
            entityId: theatre._id,
            action: "updateTheatre",
            byUserId: req.user.id,
            meta: req.body
        });
        res.json(theatre);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findByIdAndDelete(req.params.id);
        if (!theatre) return res.status(404).json({ error: "Theatre not found" });
        await logAudit({
            entity: "inventory",
            entityId: theatre._id,
            action: "deleteTheatre",
            byUserId: req.user.id,
        });
        res.json({ message: "Theatre Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getScreenLayout = async (req, res) => {
    try {
        const { screenId } = req.params;
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) return res.status(404).json({ error: "Theatre not found" });

        const screen = theatre.screens.find(s => s.screenId === screenId);
        if (!screen) return res.status(404).json({ error: "Screen not found" });

        res.json(screen.layout);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}