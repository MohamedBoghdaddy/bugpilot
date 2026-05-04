import express from "express";
import { body, query } from "express-validator";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/rbac.js";
import validate from "../../middlewares/validate.js";
import {
  listBugs,
  getMyBugs,
  getAssignedBugs,
  getBug,
  createBug,
  updateBug,
  assignBug,
  updateBugStatus,
  updateBugPriority,
  deleteBug,
} from "./bug.controller.js";

const router = express.Router();
router.use(authenticate);

router.get(
  "/",
  [
    query("status").optional().isIn(["OPEN", "ASSIGNED", "IN_PROGRESS", "FIXED", "CLOSED", "VERIFIED"]),
    query("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    query("severity").optional().isIn(["MINOR", "MAJOR", "CRITICAL", "BLOCKER"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  listBugs
);
router.get("/my", getMyBugs);
router.get("/assigned", getAssignedBugs);
router.get("/:id", getBug);
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    body("severity").optional().isIn(["MINOR", "MAJOR", "CRITICAL", "BLOCKER"]),
  ],
  validate,
  createBug
);
router.patch("/:id", updateBug);
router.patch(
  "/:id/assign",
  [body("assigneeId").notEmpty().withMessage("Assignee ID is required")],
  validate,
  assignBug
);
router.patch(
  "/:id/status",
  [
    body("status")
      .isIn(["OPEN", "ASSIGNED", "IN_PROGRESS", "FIXED", "CLOSED", "VERIFIED"])
      .withMessage("Valid status is required"),
  ],
  validate,
  updateBugStatus
);
router.patch(
  "/:id/priority",
  [
    body("priority")
      .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
      .withMessage("Valid priority is required"),
  ],
  validate,
  updateBugPriority
);
router.delete("/:id", authorize("ADMIN"), deleteBug);

export default router;
