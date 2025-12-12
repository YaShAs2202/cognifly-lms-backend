// routes/courseRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addResourceToCourse
} from "../controllers/courseController.js";

const router = express.Router();

/* --------------------------------------------------------
   PUBLIC ROUTES
---------------------------------------------------------*/
router.get("/", getCourses);        // Get all courses
router.get("/:id", getCourseById);  // Get one course

/* --------------------------------------------------------
   PROTECTED ROUTES (Teacher / Admin)
---------------------------------------------------------*/
router.post("/", protect, createCourse);           // Create new course
router.put("/:id", protect, updateCourse);         // Update a course
router.delete("/:id", protect, deleteCourse);      // Delete a course
router.post("/:id/add-resource", protect, addResourceToCourse); // Add resources

export default router;
