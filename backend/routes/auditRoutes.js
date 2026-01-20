import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getAuditById, getAudits } from "../controllers/auditController.js";

const router = express.Router();

router.get("/", authMiddleware, requireRole("manager", "admin"), getAudits);
router.get("/:id", authMiddleware, requireRole("manager", "admin"), getAuditById);

export default router;