import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });
process.env.DATABASE_URL =
  process.env.DATABASE_URL || process.env.MONGO_URL || process.env.MONGODB_URL;

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

const app = express();

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
      return callback(
        new Error(`CORS policy does not allow access from origin ${origin}`),
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
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
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server, io };
