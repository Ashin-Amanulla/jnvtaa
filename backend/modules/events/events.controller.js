import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import Event from "./events.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

// Get all events
export const getAllEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { status, type, search } = req.query;

  // Build query
  const query = { isPublished: true };

  if (status) query.status = status;
  if (type) query.type = type;
  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
    ];
  }

  // Execute query
  const events = await Event.find(query)
    .populate("organizer", "firstName lastName avatar")
    .populate("targetBatches", "year name")
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  const total = await Event.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { events },
    pagination,
    "Events retrieved successfully"
  );
});

// Get single event
export const getEventById = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate("organizer", "firstName lastName avatar email")
    .populate("targetBatches", "year name")
    .populate("attendees.user", "firstName lastName avatar batch");

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  sendSuccess(res, 200, { event }, "Event retrieved successfully");
});

// Create event
export const createEvent = asyncHandler(async (req, res) => {
  const eventData = {
    ...req.body,
    organizer: req.user.id,
  };

  const event = await Event.create(eventData);
  await event.populate("organizer", "firstName lastName avatar");
  await event.populate("targetBatches", "year name");

  sendSuccess(res, 201, { event }, "Event created successfully");
});

// Update event
export const updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Check if user is organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to update this event", 403));
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("organizer", "firstName lastName avatar")
    .populate("targetBatches", "year name");

  sendSuccess(res, 200, { event }, "Event updated successfully");
});

// Delete event
export const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Check if user is organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to delete this event", 403));
  }

  await event.deleteOne();

  sendSuccess(res, 200, null, "Event deleted successfully");
});

// RSVP to event
export const rsvpEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Check if registration is required
  if (!event.registrationRequired) {
    return next(new AppError("This event does not require registration", 400));
  }

  // Check if registration deadline has passed
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return next(new AppError("Registration deadline has passed", 400));
  }

  // Check if event is full
  if (event.maxAttendees) {
    const currentAttendees = event.attendees.filter(
      (a) => a.status !== "cancelled"
    ).length;
    if (currentAttendees >= event.maxAttendees) {
      return next(new AppError("Event is full", 400));
    }
  }

  // Check if user already registered
  const alreadyRegistered = event.attendees.find(
    (a) => a.user.toString() === req.user.id && a.status !== "cancelled"
  );

  if (alreadyRegistered) {
    return next(
      new AppError("You have already registered for this event", 400)
    );
  }

  // Add user to attendees
  event.attendees.push({
    user: req.user.id,
    status: "registered",
  });

  await event.save();
  await event.populate("attendees.user", "firstName lastName avatar batch");

  sendSuccess(res, 200, { event }, "Successfully registered for event");
});

// Cancel RSVP
export const cancelRsvp = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  // Find user's registration
  const attendee = event.attendees.find(
    (a) => a.user.toString() === req.user.id && a.status !== "cancelled"
  );

  if (!attendee) {
    return next(new AppError("You are not registered for this event", 400));
  }

  // Update status to cancelled
  attendee.status = "cancelled";

  await event.save();

  sendSuccess(res, 200, { event }, "RSVP cancelled successfully");
});

// Get upcoming events
export const getUpcomingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    status: "upcoming",
    isPublished: true,
    date: { $gte: new Date() },
  })
    .populate("organizer", "firstName lastName avatar")
    .populate("targetBatches", "year name")
    .sort({ date: 1 })
    .limit(10);

  sendSuccess(res, 200, { events }, "Upcoming events retrieved successfully");
});
