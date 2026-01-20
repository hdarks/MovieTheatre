import express from "express";
import {
    addLoyaltyPoints,
    deleteUser,
    getProfile,
    getUsersByRole,
    loginUser,
    registerUser,
    updatePreferences
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", authMiddleware, requireRole("customer", "admin"), registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getProfile);
router.patch("/preferences", authMiddleware, updatePreferences);
router.patch("/loyalty", authMiddleware, addLoyaltyPoints);
router.get("/role/:role", authMiddleware, requireRole("admin"), getUsersByRole);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteUser);
router.get("/test", (req, res) => { res.send("User routes are working"); })
export default router;