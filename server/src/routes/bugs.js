import express from "express";
import { body, param, query } from "express-validator";
import authenticate from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";
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
} from "../controllers/bugController.js";

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
  createBug
);
router.patch("/:id", updateBug);
router.patch(
  "/:id/assign",
  [body("assigneeId").notEmpty().withMessage("Assignee ID is required")],
  assignBug
);
router.patch(
  "/:id/status",
  [body("status").isIn(["OPEN", "ASSIGNED", "IN_PROGRESS", "FIXED", "CLOSED", "VERIFIED"]).withMessage("Valid status is required")],
  updateBugStatus
);
router.patch(
  "/:id/priority",
  [body("priority").isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).withMessage("Valid priority is required")],
  updateBugPriority
);
router.delete("/:id", authorize("ADMIN"), deleteBug);

export default router;
