import mongoose from "mongoose";
import { randomUUID } from "crypto";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["CUSTOMER", "TESTER", "DEVELOPER", "ADMIN"],
      default: "CUSTOMER",
    },
    avatar: { type: String, default: null },
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

export default mongoose.model("User", userSchema, "users");
