import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import moment from "moment";
import Certificate from "../models/Certificate.js";
import Course from "../models/Course.js";

const CERT_DIR = path.join(process.cwd(), "uploads", "certificates");

// ensure folder exists
if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });

// simple serial generator
const serialOf = (userId, courseId) =>
  `CF-${userId.toString().slice(-6)}-${courseId.toString().slice(-6)}-${Date.now().toString().slice(-6)}`;

export const generateCertificate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // if already issued, return existing
    const existing = await Certificate.findOne({ user: userId, course: courseId });
    if (existing) return res.json({ certificateId: existing._id, download: `/api/certificates/${existing._id}/download` });

    const serial = serialOf(userId, courseId);
    const fileName = `${serial}.pdf`;
    const filePath = path.join(CERT_DIR, fileName);

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(26).fillColor("#0ea5e9").text("Cognifly LMS", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(18).fillColor("#111827").text("Certificate of Completion", { align: "center" });
    doc.moveDown(1.2);

    // Body
    doc.fontSize(12).fillColor("#374151").text(`This certifies that`, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(22).fillColor("#111827").text(req.user.name || "Student", { align: "center" });
    doc.moveDown(0.6);
    doc.fontSize(12).fillColor("#374151").text(`has successfully completed`, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor("#111827").text(course.title || "Selected Course", { align: "center" });
    doc.moveDown(1);

    const issued = moment().format("MMM DD, YYYY");
    doc.fontSize(12).fillColor("#374151").text(`Issued on: ${issued}`, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#6b7280").text(`Certificate Serial: ${serial}`, { align: "center" });

    // QR (points to download endpoint)
    const qrData = `${req.protocol}://${req.get("host")}/api/certificates/verify/${serial}`;
    const qrPng = await QRCode.toDataURL(qrData);
    const qrBase64 = qrPng.replace(/^data:image\/png;base64,/, "");
    const qrPath = path.join(CERT_DIR, `${serial}.png`);
    fs.writeFileSync(qrPath, qrBase64, "base64");
    doc.moveDown(1.5);
    doc.image(qrPath, (doc.page.width - 100) / 2, doc.y, { width: 100 });

    // Footer line/signature
    doc.moveDown(2);
    doc.fontSize(12).fillColor("#374151").text("Authorized Signature", { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("#6b7280").text("Cognifly LMS", { align: "center" });

    doc.end();

    stream.on("finish", async () => {
      const created = await Certificate.create({
        user: userId,
        course: courseId,
        serial,
        filePath: `/uploads/certificates/${fileName}`,
      });
      // cleanup QR temp
      fs.unlink(qrPath, () => {});
      res.json({ certificateId: created._id, download: `/api/certificates/${created._id}/download` });
    });

    stream.on("error", (e) => {
      console.error(e);
      res.status(500).json({ message: "Failed to generate PDF" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    const abs = path.join(process.cwd(), cert.filePath);
    if (!fs.existsSync(abs)) return res.status(404).json({ message: "File missing" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${path.basename(abs)}"`);
    fs.createReadStream(abs).pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// (Optional) verify route returned by QR
export const verifyBySerial = async (req, res) => {
  const { serial } = req.params;
  const cert = await Certificate.findOne({ serial }).populate("user", "name email").populate("course", "title");
  if (!cert) return res.status(404).json({ message: "Invalid certificate" });
  res.json({
    valid: true,
    user: cert.user,
    course: cert.course,
    issuedAt: cert.issuedAt,
    serial: cert.serial,
  });
};
