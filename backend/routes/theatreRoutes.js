import express from "express";
import {
    addScreen,
    createTheatre,
    deleteTheatre,
    getScreenLayout,
    getTheatreById,
    getTheatres,
    removeScreen,
    updateScreenLayout,
    updateTheatre
} from "../controllers/theatreController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getTheatres);
router.post("/", authMiddleware, requireRole("manager", "admin"), createTheatre);
router.get("/:id", getTheatreById);
router.patch("/:id", authMiddleware, requireRole("manager", "admin"), updateTheatre);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteTheatre);

router.post("/:id/screens", authMiddleware, requireRole("manager", "admin"), addScreen);
router.patch("/:id/screens/:screenId", authMiddleware, requireRole("manager", "admin"), updateScreenLayout);
router.delete("/:id/screens/:screenId", authMiddleware, requireRole("admin"), removeScreen);
router.get("/:id/screens/:screenId/layout", authMiddleware, requireRole("admin", "manager"), getScreenLayout);

export default router;