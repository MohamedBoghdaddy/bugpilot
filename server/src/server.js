import { fileURLToPath } from "url";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// --- Environment validation ---
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

import logger from "./utils/logger.js";
import connectDB from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "https://bugpilot.netlify.app",
  "https://bugpilot.onrender.com",
  "http://localhost:3000",
  "http://localhost:5000",
].filter(Boolean);

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
  server.listen(PORT, "0.0.0.0", () => {
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
