import express from "express";
import { createMovie, deleteMovie, getMovieById, getMovies, updateMovie } from "../controllers/movieController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getMovies);
router.get("/:id", getMovieById);
router.post("/", authMiddleware, requireRole("manager", "admin"), createMovie);
router.patch("/:id", authMiddleware, requireRole("manager", "admin"), updateMovie);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteMovie);

export default router;