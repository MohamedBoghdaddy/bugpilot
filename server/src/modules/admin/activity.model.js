import mongoose from "mongoose";
import { randomUUID } from "crypto";

const activitySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    action: { type: String, required: true },
    details: { type: String, default: null },
    bug: { type: String, ref: "Bug", default: null },
    user: { type: String, ref: "User", required: true },
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

activitySchema.index({ bug: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ action: 1 });
activitySchema.index({ createdAt: -1 });

export default mongoose.model("Activity", activitySchema, "activities");
