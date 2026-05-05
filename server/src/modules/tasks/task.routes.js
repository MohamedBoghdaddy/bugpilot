import express from "express";
import { body } from "express-validator";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/rbac.js";
import {
  getMyTasks,
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "./task.controller.js";

const router = express.Router();
router.use(authenticate);

// Restrict task access to internal roles only
router.use(authorize("ADMIN", "TESTER", "DEVELOPER"));

router.get("/my", getMyTasks);
router.get("/", listTasks);
router.get("/:id", getTask);
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("dueDate").optional().isISO8601(),
  ],
  createTask,
);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
