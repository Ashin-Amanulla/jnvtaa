import rateLimit from "express-rate-limit";

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;

const jsonMessage = (message) => ({
  status: "error",
  message,
});

export const authLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many auth attempts. Please try again later."),
});

export const writeLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_WRITE_MAX, 10) || 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => ["GET", "HEAD", "OPTIONS"].includes(req.method),
  message: jsonMessage("Too many requests. Please try again later."),
});

export const readLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 1600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !["GET", "HEAD"].includes(req.method),
  message: jsonMessage("Too many requests. Please try again later."),
});

export const galleryUploadLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX, 10) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage("Too many uploads. Please try again later."),
});
