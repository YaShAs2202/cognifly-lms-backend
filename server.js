// server.js

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";


// Route imports
import authRoutes from "./routes/authRoutes.js";
// ⚠️ If these routes don’t exist yet, comment them out temporarily
// import certificateRoutes from "./routes/certificateRoutes.js";
// import reportRoutes from "./routes/reportRoutes.js";

// Load environment variables
dotenv.config();

// ES module path fix (so Render & Node understand __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Basic middlewares
app.use(cors());
app.use(express.json());

// ✅ API routes
app.use("/api/auth", authRoutes);
// app.use("/api/certificates", certificateRoutes);
// app.use("/api/reports", reportRoutes);
   app.use("/api/courses", courseRoutes);
   app.use("/api/enrollments", enrollmentRoutes);
  app.use("/api/payment", paymentRoutes);

// ✅ Serve static files (e.g., PDFs, uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Test route to confirm API is live
app.get("/", (req, res) => {
  res.send("🚀 Cognifly LMS Backend is running successfully!");
});

// ✅ MongoDB Connection
console.log("Checking Mongo URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing in .env");

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ✅ Handle unexpected errors gracefully
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});
