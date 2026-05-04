import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
} from "./auth.controller.js";
import authenticate from "../../middlewares/authMiddleware.js";
import validate from "../../middlewares/validate.js";

const router = express.Router();

const passwordRules = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("password")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter"),
  body("password")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    ...passwordRules,
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.post("/logout", logout);
router.post("/refresh", refresh);

router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail().withMessage("Valid email is required")],
  validate,
  forgotPassword
);

router.post("/reset-password/:token", passwordRules, validate, resetPassword);

router.get("/me", authenticate, getMe);

export default router;
