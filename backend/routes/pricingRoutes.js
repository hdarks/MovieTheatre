import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    addPricingRule, deletePricingRule,
    getPricingRules, updatePricingRule
} from "../controllers/pricingController.js";

const router = express.Router();

router.post("/:showtimeId/pricing", authMiddleware, requireRole("manager", "admin"), addPricingRule);
router.get("/:showtimeId/pricing", authMiddleware, requireRole("manager", "admin"), getPricingRules);
router.put("/:showtimeId/pricing/:ruleId", authMiddleware, requireRole("manager", "admin"), updatePricingRule);
router.delete("/:showtimeId/pricing/:ruleId", authMiddleware, requireRole("manager", "admin"), deletePricingRule);

export default router;