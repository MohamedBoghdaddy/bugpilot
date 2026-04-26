import mongoose from "mongoose";
import dns from "dns";
import logger from "../utils/logger.js";

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      logger.info("MongoDB connection established")
    );
    mongoose.connection.on("error", (err) =>
      logger.error("MongoDB connection error", { message: err.message })
    );
    mongoose.connection.on("disconnected", () =>
      logger.warn("MongoDB disconnected. Attempting to reconnect...")
    );
    mongoose.connection.on("reconnected", () =>
      logger.info("MongoDB reconnected")
    );

    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 30000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error("MongoDB initial connection failed", { message: err.message });
    process.exit(1);
  }
};

export default connectDB;
