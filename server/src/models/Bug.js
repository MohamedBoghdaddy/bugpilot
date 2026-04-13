import mongoose from "mongoose";
import { randomUUID } from "crypto";

const bugSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    title: { type: String, required: true },
    description: { type: String, required: true },
    stepsToReproduce: { type: String, default: null },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["OPEN", "ASSIGNED", "IN_PROGRESS", "FIXED", "CLOSED", "VERIFIED"],
      default: "OPEN",
    },
    severity: {
      type: String,
      enum: ["MINOR", "MAJOR", "CRITICAL", "BLOCKER"],
      default: "MAJOR",
    },
    reporter: { type: String, ref: "User", required: true },
    assignee: { type: String, ref: "User", default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model("Bug", bugSchema, "bugs");
