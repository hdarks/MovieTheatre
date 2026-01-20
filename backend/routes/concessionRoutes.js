import express from "express";
import {
    adjustStock,
    createConcession,
    deleteConcession,
    getConcession,
    getConcessionById,
    updateConcession
} from "../controllers/concessionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getConcession);
router.get("/:id", getConcessionById);

router.post("/", authMiddleware, requireRole("manager", "admin"), createConcession);
router.patch("/:id", authMiddleware, requireRole("manager", "admin"), updateConcession);
router.patch("/:id/stock", authMiddleware, requireRole("staff", "manager", "admin"), adjustStock);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteConcession);

export default router;