import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "./auth.model.js";
import Activity from "../admin/activity.model.js";
import logger from "../../utils/logger.js";
import {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_COOKIE_OPTIONS,
} from "./auth.service.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

export const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      role: role ? role.toUpperCase() : "CUSTOMER",
    });

    await Activity.create({
      action: "USER_REGISTERED",
      details: `User ${name} registered`,
      user: user.id,
    });

    logger.info("User registered", { userId: user.id, email: user.email, role: user.role });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const hashedRefresh = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await User.findByIdAndUpdate(user.id, {
      refreshToken: hashedRefresh,
      lastLoginAt: new Date(),
    });

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    const { password: _pw, ...userData } = user.toJSON();
    res.status(201).json({ token: accessToken, user: userData });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordResetToken +passwordResetExpires +refreshToken +loginAttempts +lockUntil"
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is deactivated. Contact support." });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({
        error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = user.loginAttempts + 1;
      const update = { loginAttempts: attempts };
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        update.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        update.loginAttempts = 0;
        logger.warn("Account locked after failed attempts", { userId: user.id, email: user.email });
      }
      await User.findByIdAndUpdate(user.id, update);
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const hashedRefresh = crypto.createHash("sha256").update(refreshToken).digest("hex");

    await User.findByIdAndUpdate(user.id, {
      loginAttempts: 0,
      lockUntil: null,
      lastLoginAt: new Date(),
      refreshToken: hashedRefresh,
    });

    logger.info("User logged in", { userId: user.id, email: user.email });
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    const { password: _pw, ...userData } = user.toJSON();
    res.json({ token: accessToken, user: userData });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token." });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid or expired refresh token." });
    }

    if (decoded.type !== "refresh") {
      return res.status(401).json({ error: "Invalid token type." });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user || user.refreshToken !== hashed) {
      return res.status(401).json({ error: "Refresh token revoked." });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is deactivated." });
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);
    const newHashed = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    await User.findByIdAndUpdate(user.id, { refreshToken: newHashed });
    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({ token: newAccessToken });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const decoded = (() => {
        try {
          return jwt.decode(token);
        } catch {
          return null;
        }
      })();
      if (decoded?.userId) {
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      }
    }
    res.clearCookie("refreshToken", { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
    res.json({ message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    const successMsg = "If that email exists, a reset link has been sent.";
    if (!user) return res.json({ message: successMsg });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await User.findByIdAndUpdate(user.id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    });

    logger.info("Password reset requested", { userId: user.id });

    const responseData = { message: successMsg };
    if (process.env.NODE_ENV !== "production") {
      responseData.resetToken = resetToken;
    }

    res.json(responseData);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      loginAttempts: 0,
      lockUntil: null,
      refreshToken: null,
    });

    await Activity.create({
      action: "PASSWORD_RESET",
      details: "Password was reset via reset token",
      user: user.id,
    });

    logger.info("Password reset completed", { userId: user.id });
    res.clearCookie("refreshToken", { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
    res.json({ message: "Password reset successfully. Please log in." });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
