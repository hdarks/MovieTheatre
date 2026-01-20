import Movie from "../model/Movie.js";
import { logAudit } from "../utils/auditLogger.js";

export const createMovie = async (req, res) => {
    try {
        const movie = new Movie(req.body);
        await movie.save();
        await logAudit({
            entity: "movie",
            entityId: movie._id,
            action: "createMovie",
            byUserId: req.user?.id || null,
            meta: req.body
        });
        res.status(201).json(movie);
    } catch (err) {
        console.error("CreateMovie error: ", err);
        res.status(400).json({ error: err.message });
    }
};

export const getMovies = async (req, res) => {
    try {
        const { query, genre, language, active } = req.query;
        const filter = {};

        if (query) filter.$text = { $search: query };
        if (genre) filter.genres = genre;
        if (language) filter.languages = language;
        if (active !== undefined) filter.active = active === "true";

        const movies = await Movie.find(filter).sort({ createdAt: -1 });
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ error: "Movie not Found" });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        await logAudit({
            entity: "movie",
            entityId: movie._id,
            action: "updateMovie",
            byUserId: req.user.id,
            meta: req.body
        });
        res.json(movie);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        await logAudit({
            entity: "movie",
            entityId: movie._id,
            action: "deleteMovie",
            byUserId: req.user.id
        });
        res.json({ message: "Movie deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: Error.message });
    }
};