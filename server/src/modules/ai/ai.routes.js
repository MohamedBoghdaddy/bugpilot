import express from "express";
import { body } from "express-validator";
import authenticate from "../../middlewares/authMiddleware.js";
import { classifyPriority, getRecommendedAssignee, getBugSummary } from "./ai.controller.js";

const router = express.Router();
router.use(authenticate);

router.post(
  "/priority",
  [body("description").trim().notEmpty().withMessage("Description is required")],
  classifyPriority
);
router.post(
  "/recommend-assignee",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
  ],
  getRecommendedAssignee
);
router.post(
  "/summarize",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
  ],
  getBugSummary
);

export default router;
