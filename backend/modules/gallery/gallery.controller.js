import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import Gallery from "./gallery.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

// Get all gallery items
export const getAllGalleryItems = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { category, type, batch, event, search } = req.query;

  // Build query
  const query = { isPublished: true, isApproved: true };

  if (category) query.category = category;
  if (type) query.type = type;
  if (batch) query.batch = batch;
  if (event) query.event = event;
  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
    ];
  }

  // Execute query
  const items = await Gallery.find(query)
    .populate("uploadedBy", "firstName lastName avatar")
    .populate("batch", "year name")
    .populate("event", "title date")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Gallery.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { items },
    pagination,
    "Gallery items retrieved successfully"
  );
});

// Get single gallery item
export const getGalleryItemById = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id)
    .populate("uploadedBy", "firstName lastName avatar batch")
    .populate("batch", "year name")
    .populate("event", "title date")
    .populate("comments.user", "firstName lastName avatar");

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  sendSuccess(res, 200, { item }, "Gallery item retrieved successfully");
});

// Create gallery item
export const createGalleryItem = asyncHandler(async (req, res) => {
  const itemData = {
    ...req.body,
    uploadedBy: req.user.id,
    isApproved: req.user.role === "admin" || req.user.role === "moderator",
  };

  const item = await Gallery.create(itemData);
  await item.populate("uploadedBy", "firstName lastName avatar");

  sendSuccess(res, 201, { item }, "Gallery item created successfully");
});

// Update gallery item
export const updateGalleryItem = asyncHandler(async (req, res, next) => {
  let item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  // Check if user is uploader or admin
  if (item.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to update this item", 403));
  }

  item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("uploadedBy", "firstName lastName avatar");

  sendSuccess(res, 200, { item }, "Gallery item updated successfully");
});

// Delete gallery item
export const deleteGalleryItem = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  // Check if user is uploader or admin
  if (item.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to delete this item", 403));
  }

  await item.deleteOne();

  sendSuccess(res, 200, null, "Gallery item deleted successfully");
});

// Approve gallery item (Admin)
export const approveGalleryItem = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  item.isApproved = true;
  await item.save();

  sendSuccess(res, 200, { item }, "Gallery item approved successfully");
});

// Like gallery item
export const likeGalleryItem = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  // Check if already liked
  const alreadyLiked = item.likes.includes(req.user.id);

  if (alreadyLiked) {
    // Unlike
    item.likes = item.likes.filter((id) => id.toString() !== req.user.id);
  } else {
    // Like
    item.likes.push(req.user.id);
  }

  await item.save();

  sendSuccess(
    res,
    200,
    { item, isLiked: !alreadyLiked },
    "Like toggled successfully"
  );
});

// Add comment
export const addComment = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new AppError("Gallery item not found", 404));
  }

  const { content } = req.body;

  if (!content) {
    return next(new AppError("Comment content is required", 400));
  }

  item.comments.push({
    user: req.user.id,
    content,
  });

  await item.save();
  await item.populate("comments.user", "firstName lastName avatar");

  sendSuccess(res, 201, { item }, "Comment added successfully");
});
