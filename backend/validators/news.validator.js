import Joi from "joi";

export const createNewsSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(10).required(),
  excerpt: Joi.string().max(300).allow(""),
  coverImage: Joi.string().allow(""),
  category: Joi.string().valid(
    "achievement",
    "event",
    "announcement",
    "alumni_story",
    "school_update",
    "other"
  ),
  tags: Joi.array().items(Joi.string()),
  isPublished: Joi.boolean(),
});

export const updateNewsSchema = createNewsSchema.fork(
  ["title", "content"],
  (schema) => schema.optional()
);

export const addCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});
