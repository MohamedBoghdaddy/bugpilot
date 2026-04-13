import express from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("name").trim().notEmpty().withMessage("Name is required"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

export default router;
