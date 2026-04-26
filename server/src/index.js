import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";
import requestLogger from "./middleware/requestLogger.js";
import { mongoSanitizeMiddleware, xssSanitize } from "./middleware/sanitize.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// --- Environment validation ---
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  logger.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

import authRoutes from "./routes/auth.js";
import bugRoutes from "./routes/bugs.js";
import commentRoutes from "./routes/comments.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import reportRoutes from "./routes/reports.js";
import storyRoutes from "./routes/stories.js";
import taskRoutes from "./routes/tasks.js";
import permissionRoutes from "./routes/permissions.js";
import aiRoutes from "./routes/ai.js";
import attachmentRoutes from "./routes/attachments.js";

const app = express();

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
    status: "ok",
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
    error: process.env.NODE_ENV === "production" ? "Internal server error." : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection", { message: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { message: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});

export { app, server, io };
