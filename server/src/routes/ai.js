import express from "express";
import { body, validationResult } from "express-validator";
import authenticate from "../middleware/auth.js";
import { classifyBugPriority,
  recommendAssignee,
  summarizeBug, } from "../services/aiService.js";

const router = express.Router();
router.use(authenticate);

router.post(
  "/priority",
  [
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { description } = req.body;
      const result = await classifyBugPriority(description);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/recommend-assignee",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, description } = req.body;
      const result = await recommendAssignee(title, description);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/summarize",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, description } = req.body;
      const result = await summarizeBug(title, description);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
