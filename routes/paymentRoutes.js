import express from "express";
import { confirmPaymentAndEnroll, getUserEnrolledCourses } from "../controllers/paymentController.js";

const router = express.Router();

// Confirm payment → enroll
router.post("/confirm", confirmPaymentAndEnroll);

// Get enrolled courses
router.get("/enrolled/:userId", getUserEnrolledCourses);

export default router;
