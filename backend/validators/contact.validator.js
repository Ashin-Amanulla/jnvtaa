import Joi from "joi";

export const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email",
    "string.empty": "Email is required",
  }),
  subject: Joi.string().min(3).max(200).required().messages({
    "string.empty": "Subject is required",
  }),
  message: Joi.string().min(10).max(5000).required().messages({
    "string.min": "Message must be at least 10 characters",
    "string.empty": "Message is required",
  }),
});
