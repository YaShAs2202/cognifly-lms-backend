// routes/courseRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  deleteCourse,
  addResourceToCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/", protect, createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.delete("/:id", protect, deleteCourse);

// FIXED: Now this function exists and is imported
router.post("/:id/add-resource", protect, addResourceToCourse);

export default router;
