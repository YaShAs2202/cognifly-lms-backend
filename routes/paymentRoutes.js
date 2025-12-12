import express from "express";
import {
  confirmPaymentAndEnroll,
  getUserEnrolledCourses,
} from "../controllers/paymentController.js";

const router = express.Router();

// POST: Confirm Payment + Enroll
router.post("/confirm", confirmPaymentAndEnroll);

// GET: All enrolled courses for a user
router.get("/enrolled/:userId", getUserEnrolledCourses);

export default router;
