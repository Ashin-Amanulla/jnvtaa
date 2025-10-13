import mongoose from "mongoose";
import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import News from "./news.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

// Get all news
export const getAllNews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { category, search, tags } = req.query;

  // Build query
  const query = { isPublished: true };

  if (category) query.category = category;
  if (tags) query.tags = { $in: tags.split(",") };
  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { content: new RegExp(search, "i") },
    ];
  }

  // Execute query
  const news = await News.find(query)
    .populate("author", "firstName lastName avatar")
    .select("-content")
    .skip(skip)
    .limit(limit)
    .sort({ publishedAt: -1 });

  const total = await News.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(res, 200, { news }, pagination, "News retrieved successfully");
});

// Get single news by ID or slug
export const getNewsById = asyncHandler(async (req, res, next) => {
  const query = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  const news = await News.findOne(query)
    .populate("author", "firstName lastName avatar batch")
    .populate("comments.user", "firstName lastName avatar")
    .populate("likes", "firstName lastName avatar");

  if (!news) {
    return next(new AppError("News not found", 404));
  }

  // Increment views
  news.views += 1;
  await news.save({ validateBeforeSave: false });

  sendSuccess(res, 200, { news }, "News retrieved successfully");
});

// Create news
export const createNews = asyncHandler(async (req, res) => {
  const newsData = {
    ...req.body,
    author: req.user.id,
  };

  const news = await News.create(newsData);
  await news.populate("author", "firstName lastName avatar");

  sendSuccess(res, 201, { news }, "News created successfully");
});

// Update news
export const updateNews = asyncHandler(async (req, res, next) => {
  let news = await News.findById(req.params.id);

  if (!news) {
    return next(new AppError("News not found", 404));
  }

  // Check if user is author or admin
  if (news.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to update this news", 403));
  }

  news = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("author", "firstName lastName avatar");

  sendSuccess(res, 200, { news }, "News updated successfully");
});

// Delete news
export const deleteNews = asyncHandler(async (req, res, next) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    return next(new AppError("News not found", 404));
  }

  // Check if user is author or admin
  if (news.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to delete this news", 403));
  }

  await news.deleteOne();

  sendSuccess(res, 200, null, "News deleted successfully");
});

// Like news
export const likeNews = asyncHandler(async (req, res, next) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    return next(new AppError("News not found", 404));
  }

  // Check if already liked
  const alreadyLiked = news.likes.includes(req.user.id);

  if (alreadyLiked) {
    // Unlike
    news.likes = news.likes.filter((id) => id.toString() !== req.user.id);
  } else {
    // Like
    news.likes.push(req.user.id);
  }

  await news.save();

  sendSuccess(
    res,
    200,
    { news, isLiked: !alreadyLiked },
    "News like toggled successfully"
  );
});

// Add comment
export const addComment = asyncHandler(async (req, res, next) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    return next(new AppError("News not found", 404));
  }

  const { content } = req.body;

  if (!content) {
    return next(new AppError("Comment content is required", 400));
  }

  news.comments.push({
    user: req.user.id,
    content,
  });

  await news.save();
  await news.populate("comments.user", "firstName lastName avatar");

  sendSuccess(res, 201, { news }, "Comment added successfully");
});

// Delete comment
export const deleteComment = asyncHandler(async (req, res, next) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    return next(new AppError("News not found", 404));
  }

  const comment = news.comments.id(req.params.commentId);

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  // Check if user is comment author or admin
  if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to delete this comment", 403));
  }

  comment.deleteOne();
  await news.save();

  sendSuccess(res, 200, { news }, "Comment deleted successfully");
});

// Get latest news
export const getLatestNews = asyncHandler(async (req, res) => {
  const news = await News.find({ isPublished: true })
    .populate("author", "firstName lastName avatar")
    .select("-content")
    .sort({ publishedAt: -1 })
    .limit(5);

  sendSuccess(res, 200, { news }, "Latest news retrieved successfully");
});
