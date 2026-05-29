import Joi from "joi";

const locationSchema = Joi.object({
  venue: Joi.string().allow(""),
  address: Joi.string().allow(""),
  city: Joi.string().allow(""),
  country: Joi.string().allow(""),
  isVirtual: Joi.boolean(),
  virtualLink: Joi.string().allow(""),
});

export const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  type: Joi.string().valid(
    "reunion",
    "annual_meet",
    "virtual",
    "social",
    "workshop",
    "other"
  ),
  date: Joi.date().required(),
  endDate: Joi.date(),
  location: locationSchema,
  coverImage: Joi.string().allow(""),
  gallery: Joi.array().items(Joi.string()),
  targetBatches: Joi.array().items(Joi.string()),
  registrationRequired: Joi.boolean(),
  maxAttendees: Joi.number().integer().min(1),
  registrationDeadline: Joi.date(),
  status: Joi.string().valid("upcoming", "ongoing", "completed", "cancelled"),
  isPublished: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
});

export const updateEventSchema = createEventSchema.fork(
  ["title", "description", "date"],
  (schema) => schema.optional()
);
