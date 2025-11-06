import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Progress from "../models/Progress.js";
import Course from "../models/Course.js";
import Certificate from "../models/Certificate.js";

const router = express.Router();

// Student report
router.get("/student", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const progress = await Progress.find({ user: userId }).populate("course", "title");
    const certCount = await Certificate.countDocuments({ user: userId });
    const totalCourses = progress.length;
    const avgProgress =
      totalCourses === 0 ? 0 : Math.round(progress.reduce((s, p) => s + (p.percent || 0), 0) / totalCourses);

    res.json({
      totalCourses,
      avgProgress,
      certificates: certCount,
      progressByCourse: progress.map((p) => ({
        courseId: p.course._id,
        courseTitle: p.course.title,
        percent: p.percent || 0,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Teacher report (courses taught by teacher -> average student progress per course)
router.get("/teacher", protect, async (req, res) => {
  try {
    const teacherId = req.user._id;
    // adjust "instructor" field to match your Course model
    const myCourses = await Course.find({ instructor: teacherId }, "_id title");

    // aggregate progress per each course
    const results = await Promise.all(
      myCourses.map(async (c) => {
        const items = await Progress.find({ course: c._id });
        const avg = items.length === 0 ? 0 : Math.round(items.reduce((s, p) => s + (p.percent || 0), 0) / items.length);
        return {
          courseId: c._id,
          courseTitle: c.title,
          learners: items.length,
          avgProgress: avg,
        };
      })
    );

    res.json({
      totalCourses: myCourses.length,
      metrics: results,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
