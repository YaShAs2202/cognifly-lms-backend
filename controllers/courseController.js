// server/controllers/courseController.js
import Course from "../models/Course.js";

/* --------------------------------------------------------
   CREATE COURSE (Teacher Only)
---------------------------------------------------------*/
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, price, lessons } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newCourse = await Course.create({
      title,
      description,
      thumbnail: thumbnail || "",
      price: price || 0,
      lessons: lessons || [],
      teacher: req.user._id,
      resources: [],
    });

    res.status(201).json(newCourse);
  } catch (err) {
    console.error("CREATE COURSE ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* --------------------------------------------------------
   GET ALL COURSES (Public)
---------------------------------------------------------*/
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("teacher", "name email");
    res.json(courses);
  } catch (err) {
    console.error("GET COURSES ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* --------------------------------------------------------
   GET ONE COURSE BY ID
---------------------------------------------------------*/
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("teacher", "name email");

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course);
  } catch (err) {
    console.error("GET COURSE ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
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
      return res.status(403).json({ message: "Not authorized to update this course" });
    }

    Object.assign(course, req.body);

    await course.save();

    res.json(course);
  } catch (err) {
    console.error("UPDATE COURSE ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
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
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    await Course.deleteOne({ _id: course._id }); // FIXED - remove() deprecated

    res.json({ message: "Course removed successfully" });
  } catch (err) {
    console.error("DELETE COURSE ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* --------------------------------------------------------
   ADD RESOURCE (Video/PDF/Link) to course
---------------------------------------------------------*/
export const addResourceToCourse = async (req, res) => {
  try {
    const { type, title, url } = req.body;

    if (!type || !title || !url) {
      return res.status(400).json({ message: "Type, title, and URL are required" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const resource = {
      type,        // "video", "pdf", "link"
      title,
      url,
      uploadedAt: new Date(),
    };

    if (!Array.isArray(course.resources)) {
      course.resources = [];
    }

    course.resources.push(resource);
    await course.save();

    res.json({ message: "Resource added successfully", course });
  } catch (err) {
    console.error("ADD RESOURCE ERROR:", err);
    res.status(500).json({ message: "Cannot add resource" });
  }
};
