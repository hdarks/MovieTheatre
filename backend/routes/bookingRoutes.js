import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    cancelBooking,
    confirmBooking,
    createBooking,
    getBookings,
    getMyBookings,
    refundBooking,
    validateTicket
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole("customer", "staff"), createBooking);
router.get("/me", authMiddleware, requireRole("customer"), getMyBookings);
router.patch("/:bookingId/cancel", authMiddleware, requireRole("customer", "manager"), cancelBooking);

router.patch("/:bookingId/confirm", authMiddleware, requireRole("customer", "manager"), confirmBooking);

router.patch("/:bookingId/refund", authMiddleware, requireRole("manager", "admin"), refundBooking);

router.post("/validate", authMiddleware, requireRole("staff", "manager", "admin"), validateTicket);

router.get("/", authMiddleware, requireRole("staff", "manager", "admin"), getBookings);

export default router;