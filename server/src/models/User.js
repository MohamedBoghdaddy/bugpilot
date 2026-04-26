import mongoose from "mongoose";
import { randomUUID } from "crypto";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["CUSTOMER", "TESTER", "DEVELOPER", "ADMIN"],
      default: "CUSTOMER",
      set: (v) => (v ? v.toUpperCase() : v),
    },
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    passwordResetToken: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },
    refreshToken: { type: String, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.refreshToken;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

userSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

export default mongoose.model("User", userSchema, "users");
