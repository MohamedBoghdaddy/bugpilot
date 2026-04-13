import mongoose from "mongoose";
import { randomUUID } from "crypto";

const storySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    title: { type: String, required: true },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    storyPoints: { type: Number, default: 0 },
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

export default mongoose.model("Story", storySchema, "stories");
