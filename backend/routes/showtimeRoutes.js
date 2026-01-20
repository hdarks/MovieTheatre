import express from "express";
import {
    cancelShowtime,
    createShowtime,
    getSeatmap,
    getShowtimeById,
    getShowtimes,
    lockSeats,
    releaseLocks,
    updateShowtime
} from "../controllers/showtimeController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getShowtimes);
router.get("/:id", getShowtimeById);
router.get("/:id/seatmap", getSeatmap);

router.post("/", authMiddleware, requireRole("manager", "admin"), createShowtime);
router.patch("/:id", authMiddleware, requireRole("manager", "admin"), updateShowtime);
router.post("/:id/cancel", authMiddleware, requireRole("manager", "admin"), cancelShowtime);

router.post("/:id/lock", authMiddleware, requireRole("customer"), lockSeats);
router.post("/:id/release-locks", authMiddleware, requireRole("customer"), releaseLocks);

export default router;