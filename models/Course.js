// server/models/Course.js
import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "pdf"],
    required: true,
  },
  title: { type: String, required: true },
  url: { type: String, required: true }, // PDF or video link
});

const lessonSchema = new mongoose.Schema({
  title: String,
  content: String, // video URL or text
  order: Number,
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  thumbnail: { type: String, default: "" }, // course cover image
  price: { type: Number, default: 0 },

  lessons: [lessonSchema],

  // ⭐ Added properly inside schema
  resources: [resourceSchema], // PDFs & Videos

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Course", courseSchema);
