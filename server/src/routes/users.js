import express from "express";
import { body } from "express-validator";
import authenticate from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";
import {
  listUsers,
  getUser,
  updateUserRole,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();
router.use(authenticate);

router.get("/", listUsers);
router.get("/:id", getUser);
router.patch(
  "/:id/role",
  authorize("ADMIN"),
  [body("role").isIn(["CUSTOMER", "TESTER", "DEVELOPER", "ADMIN"]).withMessage("Valid role is required")],
  updateUserRole
);
router.patch(
  "/:id",
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().normalizeEmail(),
    body("password").optional().isLength({ min: 6 }),
  ],
  updateUser
);
router.delete("/:id", authorize("ADMIN"), deleteUser);

export default router;
