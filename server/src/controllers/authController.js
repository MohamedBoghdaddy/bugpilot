import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role ? role.toUpperCase() : "CUSTOMER",
    });

    await Activity.create({
      action: "USER_REGISTERED",
      details: `User ${name} registered`,
      user: user.id,
    });

    const token = generateToken(user.id);
    const { password: _pw, ...userData } = user.toJSON();

    res.status(201).json({ token, user: userData });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user.id);
    const { password: _pw, ...userData } = user.toJSON();

    res.json({ token, user: userData });
  } catch (err) {
    next(err);
  }
};
