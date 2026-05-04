import express from "express";
import { body } from "express-validator";
import authenticate from "../../middlewares/authMiddleware.js";
import { getMyTasks, listTasks, getTask, createTask, updateTask, deleteTask } from "./task.controller.js";

const router = express.Router();
router.use(authenticate);

router.get("/my", getMyTasks);
router.get("/", listTasks);
router.get("/:id", getTask);
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("dueDate").optional().isISO8601(),
  ],
  createTask
);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
