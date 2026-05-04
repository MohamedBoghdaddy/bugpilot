import mongoose from "mongoose";
import { randomUUID } from "crypto";

const taskSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    title: { type: String, required: true },
    status: { type: String, default: "TODO" },
    assignee: { type: String, ref: "User", default: null },
    bug: { type: String, ref: "Bug", default: null },
    story: { type: String, ref: "Story", default: null },
    dueDate: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

export default mongoose.model("Task", taskSchema, "tasks");
