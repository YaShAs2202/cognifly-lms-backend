// server/controllers/paymentController.js

import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

// CONFIRM PAYMENT + ENROLL STUDENT
export const confirmPaymentAndEnroll = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ msg: "Missing userId or courseId" });
    }

    // Check if course exists
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({ msg: "Course not found" });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Prevent duplicate enrollment
    const alreadyEnrolled = await Enrollment.findOne({ userId, courseId });

    if (alreadyEnrolled) {
      return res.json({
        success: true,
        msg: "Already enrolled",
      });
    }

    // Create new enrollment
    const newEnrollment = new Enrollment({
      userId,
      courseId,
    });

    await newEnrollment.save();

    return res.json({
      success: true,
      msg: "Enrollment successful",
      enrollment: newEnrollment,
    });

  } catch (error) {
    console.error("Payment Enrollment Error:", error);
    res.status(500).json({ msg: "Server error during enrollment" });
  }
};

// GET ALL COURSES USER IS ENROLLED IN
export const getUserEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all enrollments for user
    const enrollments = await Enrollment.find({ userId }).populate("courseId");

    return res.json({
      success: true,
      courses: enrollments.map((enroll) => enroll.courseId),
    });
  } catch (error) {
    console.error("Fetch Enrolled Courses Error:", error);
    res.status(500).json({ msg: "Server error fetching enrolled courses" });
  }
};
