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
        const { name, layout } = req.body;
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) return res.status(404).json({ error: "Theatre not found" });

        const newScreen = { name, layout };
        theatre.screens.push(newScreen);
        await theatre.save();

        const addedScreen = theatre.screens[theatre.screens.length - 1];
        await logAudit({
            entity: "inventory",
            entityId: addedScreen._id,
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

        const screen = theatre.screens.id(screenId);
        if (!screen) return res.status(404).json({ error: "Screen not found" });

        if (layout) {
            screen.layout.rows = layout.rows;
            screen.layout.cols = layout.cols;
            screen.layout.seats = layout.seats;

            if (layout?.seats) {
                const invalidSeats = layout.seats.filter(
                    (s) =>
                        typeof s.row !== "string" ||
                        typeof s.col !== "number" ||
                        s.col < 1 || s.col > layout.cols ||
                        s.row.charCodeAt(0) - 65 >= layout.rows
                );
                if (invalidSeats.length > 0) {
                    return res.status(400).json({ error: "Invalid seat cordinates in Layout" });
                }
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
        res.json({ message: "Seat array updated successfully.", theatre });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const removeScreen = async (req, res) => {
    try {
        const { screenId } = req.params;
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) return res.status(404).json({ error: "Theater not found" });

        const removedScreen = theatre.screens.id(screenId);
        if (!removedScreen) return res.status(404).json({ error: "Screen not found" });

        removedScreen.remove();
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

        const screen = theatre.screens.id(screenId);
        if (!screen) return res.status(404).json({ error: "Screen not found" });

        res.json(screen.layout);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};