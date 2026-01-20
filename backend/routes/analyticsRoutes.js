import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getAnalytics, getSystemAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/", authMiddleware, requireRole("manager", "admin"), getAnalytics);
router.get("/system", authMiddleware, requireRole("admin"), getSystemAnalytics);

export default router;