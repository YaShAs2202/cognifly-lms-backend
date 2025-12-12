import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String }, // YouTube or upload URL
    pdfUrl: { type: String },   // PDF upload URL
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);
