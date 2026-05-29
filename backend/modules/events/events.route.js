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
import { protect, optionalProtect } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  createEventSchema,
  updateEventSchema,
} from "../../validators/events.validator.js";

const router = express.Router();

// Public routes
router.get("/", optionalProtect, getAllEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/:id", getEventById);

// Protected routes
router.post("/", protect, validate(createEventSchema), createEvent);
router.put("/:id", protect, validate(updateEventSchema), updateEvent);
router.delete("/:id", protect, deleteEvent);
router.post("/:id/rsvp", protect, rsvpEvent);
router.post("/:id/cancel-rsvp", protect, cancelRsvp);

export default router;
