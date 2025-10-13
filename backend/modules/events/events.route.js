import express from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRsvp,
  getUpcomingEvents,
} from "./events.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/:id", getEventById);

// Protected routes
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);
router.post("/:id/rsvp", protect, rsvpEvent);
router.post("/:id/cancel-rsvp", protect, cancelRsvp);

export default router;
