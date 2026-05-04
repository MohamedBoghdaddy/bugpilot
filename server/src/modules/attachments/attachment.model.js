import mongoose from "mongoose";
import { randomUUID } from "crypto";

const attachmentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    bug: { type: String, ref: "Bug", required: true },
    uploader: { type: String, ref: "User", required: true },
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

attachmentSchema.index({ bug: 1 });
attachmentSchema.index({ uploader: 1 });

export default mongoose.model("Attachment", attachmentSchema, "attachments");
