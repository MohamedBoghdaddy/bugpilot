import mongoose from "mongoose";
import { randomUUID } from "crypto";

const commentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    content: { type: String, required: true, trim: true },
    bug: { type: String, ref: "Bug", required: true },
    author: { type: String, ref: "User", required: true },
    editedAt: { type: Date, default: null },
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

commentSchema.index({ bug: 1, createdAt: 1 });
commentSchema.index({ author: 1 });

export default mongoose.model("Comment", commentSchema, "comments");
