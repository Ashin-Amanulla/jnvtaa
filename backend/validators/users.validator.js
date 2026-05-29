import Joi from "joi";
import { ASSIGNABLE_ROLES } from "../config/roles.js";

export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...ASSIGNABLE_ROLES)
    .required()
    .messages({
      "any.only": "Role must be a valid assignable role",
      "string.empty": "Role is required",
    }),
});

export const adminUpdateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  phone: Joi.string().allow(""),
  batch: Joi.string(),
  rollNumber: Joi.string().allow(""),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid(
    "male",
    "female",
    "other",
    "prefer_not_to_say"
  ),
  avatar: Joi.string().allow(""),
  bio: Joi.string().max(500).allow(""),
  currentCity: Joi.string().allow(""),
  currentCountry: Joi.string().allow(""),
  profession: Joi.string().allow(""),
  company: Joi.string().allow(""),
  industry: Joi.string().allow(""),
  isVerified: Joi.boolean(),
  isActive: Joi.boolean(),
  role: Joi.string().valid(...ASSIGNABLE_ROLES),
  socialLinks: Joi.object({
    linkedin: Joi.string().allow(""),
    facebook: Joi.string().allow(""),
    twitter: Joi.string().allow(""),
    instagram: Joi.string().allow(""),
  }),
  privacySettings: Joi.object({
    showEmail: Joi.boolean(),
    showPhone: Joi.boolean(),
    showLocation: Joi.boolean(),
    showProfession: Joi.boolean(),
  }),
}).min(1);
