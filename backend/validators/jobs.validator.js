import Joi from "joi";

const locationSchema = Joi.object({
  city: Joi.string().allow(""),
  country: Joi.string().allow(""),
  isRemote: Joi.boolean(),
});

const salarySchema = Joi.object({
  min: Joi.number().min(0),
  max: Joi.number().min(0),
  currency: Joi.string(),
  isNegotiable: Joi.boolean(),
});

export const createJobSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  company: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(10).required(),
  requirements: Joi.string().allow(""),
  location: locationSchema,
  employmentType: Joi.string().valid(
    "full-time",
    "part-time",
    "contract",
    "internship",
    "freelance"
  ),
  experienceLevel: Joi.string().valid("entry", "mid", "senior", "executive"),
  industry: Joi.string().allow(""),
  skills: Joi.array().items(Joi.string()),
  salary: salarySchema,
  applicationUrl: Joi.string().uri().allow(""),
  applicationEmail: Joi.string().email().allow(""),
  expiresAt: Joi.date(),
  status: Joi.string().valid("active", "closed", "filled"),
  isPublished: Joi.boolean(),
});

export const updateJobSchema = createJobSchema.fork(
  ["title", "company", "description"],
  (schema) => schema.optional()
);
