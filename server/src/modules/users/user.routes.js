import express from "express";
import { body } from "express-validator";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/rbac.js";
import validate from "../../middlewares/validate.js";
import {
  listUsers,
  listAssignableUsers,
  getUser,
  updateUserRole,
  updateUser,
  deleteUser,
} from "./user.controller.js";

const router = express.Router();
router.use(authenticate);

router.get("/", authorize("ADMIN"), listUsers);
router.get(
  "/assignable",
  authorize("ADMIN", "TESTER", "DEVELOPER"),
  listAssignableUsers,
);
router.get("/:id", getUser);
router.patch(
  "/:id/role",
  authorize("ADMIN"),
  [
    body("role")
      .isIn(["CUSTOMER", "TESTER", "DEVELOPER", "ADMIN"])
      .withMessage("Valid role is required"),
  ],
  validate,
  updateUserRole,
);
router.patch(
  "/:id",
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("email").optional().isEmail().normalizeEmail(),
    body("password").optional().isLength({ min: 6 }),
  ],
  validate,
  updateUser,
);
router.delete("/:id", authorize("ADMIN"), deleteUser);

export default router;
