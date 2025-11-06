import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    serial: { type: String, required: true, unique: true },
    filePath: { type: String, required: true }, // e.g. /uploads/certificates/xxxxx.pdf
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);
