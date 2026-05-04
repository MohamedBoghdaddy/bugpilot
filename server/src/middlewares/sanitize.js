import mongoSanitize from "express-mongo-sanitize";

export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    console.warn(`NoSQL injection attempt detected in field: ${key} from ${req.ip}`);
  },
});

const XSS_PATTERN = /<script[\s\S]*?>[\s\S]*?<\/script>|javascript:/gi;

function sanitizeValue(value) {
  if (typeof value === "string") {
    return value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/javascript:/gi, "");
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") return sanitizeObject(value);
  return value;
}

function sanitizeObject(obj) {
  const sanitized = {};
  for (const [k, v] of Object.entries(obj)) {
    sanitized[k] = sanitizeValue(v);
  }
  return sanitized;
}

export const xssSanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  next();
};
