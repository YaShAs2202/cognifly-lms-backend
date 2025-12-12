// server/controllers/courseController.js
import Course from "../models/Course.js";

/* --------------------------------------------------------
   CREATE COURSE (Teacher Only)
---------------------------------------------------------*/
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, price, lessons, resources } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newCourse = await Course.create({
      title,
      description,
      thumbnail: thumbnail || "",
      price: price || 0,
      lessons: lessons || [],
      teacher: req.user?._id, // SAFE CHECK
      resources: resources || [],
    });

    return res.status(201).json(newCourse);
  } catch (err) {
    console.error("CREATE COURSE ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* --------------------------------------------------------
   GET ALL COURSES (Public)
---------------------------------------------------------*/
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("teacher", "name email");
    return res.json(courses);
  } catch (err) {
    console.error("GET COURSES ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* --------------------------------------------------------
   GET ONE COURSE BY ID
---------------------------------------------------------*/
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length < 5) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(id).populate("teacher", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.json(course);
  } catch (err) {
    console.error("GET COURSE ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* --------------------------------------------------------
   UPDATE COURSE (Teacher or Admin)
---------------------------------------------------------*/
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    const isOwner = String(course.teacher) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(course, req.body);
    await course.save();

    return res.json(course);
  } catch (err) {
    console.error("UPDATE COURSE ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* --------------------------------------------------------
   DELETE COURSE (Teacher or Admin)
---------------------------------------------------------*/
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Course not found" });

    const isOwner = String(course.teacher) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Course.deleteOne({ _id: course._id });
    return res.json({ message: "Course removed successfully" });
  } catch (err) {
    console.error("DELETE COURSE ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* --------------------------------------------------------
   ADD RESOURCE (Video/PDF) to course
---------------------------------------------------------*/
export const addResourceToCourse = async (req, res) => {
  try {
    const { type, title, url } = req.body;

    if (!type || !title || !url) {
      return res.status(400).json({
        message: "Resource type, title and URL are required"
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const resource = {
      type, // video / pdf
      title,
      url,
      uploadedAt: new Date(),
    };

    if (!Array.isArray(course.resources)) {
      course.resources = [];
    }

    course.resources.push(resource);
    await course.save();

    return res.json({
      message: "Resource added successfully",
      course,
    });
  } catch (err) {
    console.error("ADD RESOURCE ERROR:", err);
    return res.status(500).json({ message: "Cannot add resource", error: err.message });
  }
};
