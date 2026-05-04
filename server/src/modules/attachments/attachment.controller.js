import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import Attachment from "./attachment.model.js";
import Bug from "../bugs/bug.model.js";
import Activity from "../admin/activity.model.js";
import AppError from "../../utils/AppError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "..", "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "text/csv",
  "application/json",
  "video/mp4",
  "video/webm",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("File type not allowed.", 400), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter,
});

export const uploadAttachment = async (req, res, next) => {
  try {
    const bug = await Bug.findOne({ _id: req.params.bugId, deletedAt: null });
    if (!bug) return res.status(404).json({ error: "Bug not found." });

    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const url = `/uploads/${req.file.filename}`;
    const attachment = await Attachment.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url,
      bug: req.params.bugId,
      uploader: req.user.id,
    });

    await attachment.populate({ path: "uploader", select: "name" });

    await Activity.create({
      action: "ATTACHMENT_ADDED",
      details: `File "${req.file.originalname}" attached`,
      bug: req.params.bugId,
      user: req.user.id,
    });

    res.status(201).json({ attachment });
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
};

export const deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) return res.status(404).json({ error: "Attachment not found." });

    if (attachment.uploader !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this attachment." });
    }

    const filePath = path.join(uploadDir, attachment.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Attachment.findByIdAndDelete(req.params.id);

    await Activity.create({
      action: "ATTACHMENT_DELETED",
      details: `File "${attachment.originalName}" removed`,
      bug: attachment.bug,
      user: req.user.id,
    });

    res.json({ message: "Attachment deleted." });
  } catch (err) {
    next(err);
  }
};

export const getBugAttachments = async (req, res, next) => {
  try {
    const attachments = await Attachment.find({ bug: req.params.bugId })
      .populate({ path: "uploader", select: "name" })
      .sort({ createdAt: -1 });
    res.json({ attachments });
  } catch (err) {
    next(err);
  }
};
