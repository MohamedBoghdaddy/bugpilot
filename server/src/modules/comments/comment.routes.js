import express from "express";
import { body } from "express-validator";
import authenticate from "../../middlewares/authMiddleware.js";
import validate from "../../middlewares/validate.js";
import { addComment, getBugComments } from "./comment.controller.js";

const router = express.Router();
router.use(authenticate);

router.post(
  "/",
  [
    body("content").trim().notEmpty().withMessage("Comment content is required"),
    body("bugId").notEmpty().withMessage("Bug ID is required"),
  ],
  validate,
  addComment
);
router.get("/bug/:bugId", getBugComments);

export default router;
