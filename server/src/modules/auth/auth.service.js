import jwt from "jsonwebtoken";

export const ACCESS_TOKEN_TTL = "1h";
export const REFRESH_TOKEN_TTL = "7d";

export const generateAccessToken = (userId) =>
  jwt.sign({ userId, type: "access" }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

export const generateRefreshToken = (userId) =>
  jwt.sign(
    { userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};
