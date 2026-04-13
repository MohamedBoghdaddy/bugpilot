import express from "express";
import { body, query } from "express-validator";
import authenticate from "../middleware/auth.js";
import {
  listStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
} from "../controllers/storyController.js";

const router = express.Router();
router.use(authenticate);

router.get(
  "/",
  [
    query("status").optional().isIn(["TODO", "IN_PROGRESS", "DONE"]),
    query("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  listStories
);
router.get("/:id", getStory);
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("status").optional().isIn(["TODO", "IN_PROGRESS", "DONE"]),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    body("storyPoints").optional().isInt({ min: 0 }),
  ],
  createStory
);
router.patch("/:id", updateStory);
router.delete("/:id", deleteStory);

export default router;
