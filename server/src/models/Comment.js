import mongoose from "mongoose";
import { randomUUID } from "crypto";

const commentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    content: { type: String, required: true },
    bug: { type: String, ref: "Bug", required: true },
    author: { type: String, ref: "User", required: true },
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

export default mongoose.model("Comment", commentSchema, "comments");
