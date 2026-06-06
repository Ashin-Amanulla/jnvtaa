import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import passport from "passport";
import connectDB from "./config/database.js";
import configurePassport from "./config/passport.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import {
  authLimiter,
  readLimiter,
  writeLimiter,
} from "./middlewares/rateLimit.middleware.js";

// Import route
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/users/users.route.js";
import batchRoutes from "./modules/batches/batches.route.js";
import eventRoutes from "./modules/events/events.route.js";
import newsRoutes from "./modules/news/news.route.js";
import galleryRoutes from "./modules/gallery/gallery.route.js";
import donationRoutes from "./modules/donations/donations.route.js";
import jobRoutes from "./modules/jobs/jobs.route.js";
import siteContentRoutes from "./modules/site-content/site-content.route.js";
import contactRoutes from "./modules/contact-messages/contact-messages.route.js";
import notificationRoutes from "./modules/notifications/notifications.route.js";
import auditLogRoutes from "./modules/audit-log/audit-log.route.js";
import uploadRoutes from "./modules/uploads/uploads.route.js";
import mentorshipRoutes from "./modules/mentorship/mentorship.route.js";
import messageRoutes from "./modules/messages/messages.route.js";
import newsletterRoutes from "./modules/newsletter/newsletter.route.js";
import searchRoutes from "./modules/search/search.route.js";
import rolesRoutes from "./modules/roles/roles.route.js";
import fifaRoutes from "./modules/fifa/fifa.route.js";
import { startNewsletterWorker } from "./queues/newsletter.queue.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Behind nginx / load balancer — use real client IP for rate limits
app.set("trust proxy", 1);

// Connect to database
connectDB();

// Passport (Google OAuth)
configurePassport();
app.use(passport.initialize());

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const rawOrigins = process.env.CORS_ORIGIN || "http://localhost:5173";
      const allowedOrigins = rawOrigins
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      // Allow non-browser clients/tools with no Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes("*")) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);


// Rate limiting — tiered: strict auth, moderate writes, generous reads
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/", writeLimiter);
app.use("/api/", readLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "JNVTAA API is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-log", auditLogRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/fifa", fifaRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5454;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
  startNewsletterWorker();
});

export default app;
