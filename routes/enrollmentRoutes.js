// routes/enrollmentRoutes.js
import express from "express";
import Enrollment from "../models/Enrollment.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/enrollments
 * @desc    Create new manual enrollment after payment
 * @access  Private (Student)
 */
router.post("/", protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "❌ Missing courseId in request" });
    }

    // Check if already enrolled
    const exists = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (exists) {
      return res
        .status(200)
        .json({ success: false, message: "Already enrolled in this course" });
    }

    // Create enrollment record
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      paymentStatus: "manual-paid",
      enrolledAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "✅ Enrollment successful",
      enrollment,
    });
  } catch (err) {
    console.error("Error saving enrollment:", err);
    res.status(500).json({ message: "Server error while saving enrollment" });
  }
});

/**
 * @route   GET /api/enrollments/my-courses
 * @desc    Get all courses the student is enrolled in
 * @access  Private (Student)
 */
router.get("/my-courses", protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("course", "title price description")
      .sort({ enrolledAt: -1 });

    res.json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({ message: "Server error while fetching courses" });
  }
});

export default router;
