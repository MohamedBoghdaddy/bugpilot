import express from "express";
import authenticate from "../../middlewares/authMiddleware.js";
import { upload, uploadAttachment, deleteAttachment, getBugAttachments } from "./attachment.controller.js";

const router = express.Router();
router.use(authenticate);

router.get("/bug/:bugId", getBugAttachments);
router.post("/bug/:bugId", upload.single("file"), uploadAttachment);
router.delete("/:id", deleteAttachment);

export default router;
