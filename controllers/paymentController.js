import Enrollment from "../models/Enrollment.js";

// Confirm payment & enroll user
export const confirmPaymentAndEnroll = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ msg: "Missing userId or courseId" });
    }

    // Check if already enrolled
    const exists = await Enrollment.findOne({ userId, courseId });

    if (exists) {
      return res.status(400).json({ msg: "Already enrolled in this course" });
    }

    // Create enrollment
    const newEnrollment = new Enrollment({ userId, courseId });
    await newEnrollment.save();

    res.json({ msg: "Payment successful! Enrollment saved.", enrollment: newEnrollment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error during payment" });
  }
};

// Fetch enrolled courses
export const getUserEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.params;

    const enrolled = await Enrollment.find({ userId }).populate("courseId");

    res.json({ courses: enrolled.map((e) => e.courseId) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Cannot fetch enrolled courses" });
  }
};
