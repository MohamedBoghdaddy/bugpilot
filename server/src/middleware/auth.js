import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired.", code: "TOKEN_EXPIRED" });
      }
      return res.status(401).json({ error: "Invalid token." });
    }

    if (decoded.type && decoded.type !== "access") {
      return res.status(401).json({ error: "Invalid token type." });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Invalid token. User not found." });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is deactivated. Contact support." });
    }

    req.user = user.toJSON();
    next();
  } catch (err) {
    next(err);
  }
};

export default authenticate;
