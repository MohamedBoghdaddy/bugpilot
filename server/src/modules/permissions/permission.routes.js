import express from "express";
import { param, body } from "express-validator";
import authenticate from "../../middlewares/authMiddleware.js";
import authorize from "../../middlewares/rbac.js";
import { getRoles, updateRolePermissions } from "./permission.controller.js";

const router = express.Router();
router.use(authenticate);

router.get("/roles", getRoles);
router.patch(
  "/roles/:role",
  authorize("ADMIN"),
  [
    param("role")
      .isIn(["CUSTOMER", "TESTER", "DEVELOPER", "ADMIN"])
      .withMessage("Valid role is required"),
    body("permissions").isObject().withMessage("Permissions object is required"),
  ],
  updateRolePermissions
);

export default router;
