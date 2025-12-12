import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Lesson from "../models/Lesson.js";

const router = express.Router();

// CREATE LESSON
router.post("/:courseId", protect, async (req, res) => {
  try {
    const { title, description, videoUrl, pdfUrl } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const lesson = await Lesson.create({
      course: req.params.courseId,
      title,
      description,
      videoUrl,
      pdfUrl,
    });

    res.json({ success: true, lesson });
  } catch (error) {
    console.error("Lesson creation error", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL LESSONS OF A COURSE
router.get("/:courseId", protect, async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId }).sort({
      createdAt: 1,
    });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Cannot fetch lessons" });
  }
});

export default router;
