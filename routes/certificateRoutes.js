import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  generateCertificate,
  downloadCertificate,
  verifyBySerial,
} from "../controllers/certificateController.js";

const router = express.Router();

router.post("/generate", protect, generateCertificate);
router.get("/:id/download", protect, downloadCertificate);
router.get("/verify/:serial", verifyBySerial);

export default router;
