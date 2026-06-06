import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { getRedisClient } from "../helpers/cache.js";

const isDev = process.env.NODE_ENV === "development";
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;

const jsonMessage = (message) => ({
  status: "error",
  message,
});

// In development, skip all rate limiting so frequent reloads don't trigger 429s.
const devSkip = () => isDev;

/**
 * Build a Redis-backed store when Redis is available, otherwise fall back to
 * the default in-memory store. The Redis store keeps counters persistent
 * across container restarts and is shared across all processes.
 */
function makeStore(prefix) {
  const client = getRedisClient();
  if (!client) return undefined; // falls back to express-rate-limit's memory store

  return new RedisStore({
    prefix: `rl:${prefix}:`,
    // ioredis exposes arbitrary commands via .call(command, ...args)
    sendCommand: (...args) => client.call(...args),
  });
}

export const authLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: devSkip,
  store: makeStore("auth"),
  message: jsonMessage("Too many auth attempts. Please try again later."),
});

export const writeLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_WRITE_MAX, 10) || 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDev || ["GET", "HEAD", "OPTIONS"].includes(req.method),
  store: makeStore("write"),
  message: jsonMessage("Too many requests. Please try again later."),
});

export const readLimiter = rateLimit({
  windowMs,
  // Default raised to 3000 — a community site serving many page loads per visit.
  // Set RATE_LIMIT_MAX_REQUESTS in your production .env to override.
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 3000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDev || !["GET", "HEAD"].includes(req.method),
  store: makeStore("read"),
  message: jsonMessage("Too many requests. Please try again later."),
});

export const galleryUploadLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX, 10) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: devSkip,
  store: makeStore("upload"),
  message: jsonMessage("Too many uploads. Please try again later."),
});
