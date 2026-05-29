import Joi from "joi";

export const createGallerySchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(500).allow(""),
  type: Joi.string().valid("image", "video").required(),
  url: Joi.string().uri().required(),
  thumbnail: Joi.string().uri().allow(""),
  category: Joi.string().valid(
    "event",
    "batch",
    "campus",
    "achievement",
    "reunion",
    "other"
  ),
  event: Joi.string(),
  batch: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  isPublished: Joi.boolean(),
});

export const updateGallerySchema = createGallerySchema.fork(
  ["title", "type", "url"],
  (schema) => schema.optional()
);

export const addCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});
