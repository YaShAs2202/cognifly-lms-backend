import Lesson from "../models/Lesson.js";

export const uploadLesson = async (req, res) => {
  try {
    const { courseId, title, description, videoUrl } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ message: "Course ID and Title are required" });
    }

    const newLesson = await Lesson.create({
      courseId,
      title,
      description,
      videoUrl
    });

    res.status(201).json({
      message: "Lesson uploaded successfully",
      lesson: newLesson
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading lesson", error });
  }
};
