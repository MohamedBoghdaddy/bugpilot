import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import path from "path";

import logger from "./utils/logger.js";
import requestLogger from "./middlewares/requestLogger.js";
import { mongoSanitizeMiddleware, xssSanitize } from "./middlewares/sanitize.js";

import authRoutes from "./modules/auth/auth.routes.js";
import bugRoutes from "./modules/bugs/bug.routes.js";
import commentRoutes from "./modules/comments/comment.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import storyRoutes from "./modules/stories/story.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import permissionRoutes from "./modules/permissions/permission.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import attachmentRoutes from "./modules/attachments/attachment.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Required for Render/reverse-proxy deployments — must be set before rate limiters
app.set("trust proxy", 1);

// --- Security headers ---
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// --- Compression ---
app.use(compression());

// --- CORS ---
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "https://bugpilot.netlify.app",
  "https://bugpilot.onrender.com",
  "http://localhost:3000",
  "http://localhost:5000",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// --- Body parsing & cookies ---
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// --- Sanitization ---
app.use(mongoSanitizeMiddleware);
app.use(xssSanitize);

// --- HTTP request logging ---
app.use(requestLogger);

// --- Rate limiting ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts. Please try again later." },
});

app.use(globalLimiter);

// --- Static uploads ---
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- Routes ---
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/attachments", attachmentRoutes);

// --- Health check ---
app.get("/api/health", async (req, res) => {
  const { connection } = (await import("mongoose")).default;
  res.json({
    success: true,
    message: "BugPilot API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: connection.readyState === 1 ? "connected" : "disconnected",
    memory: process.memoryUsage(),
  });
});

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.statusCode || 500).json({
    error:
      process.env.NODE_ENV === "production" ? "Internal server error." : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

export default app;
