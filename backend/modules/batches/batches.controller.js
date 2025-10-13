import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import Batch from "./batches.model.js";
import User from "../users/users.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

// Get all batches
export const getAllBatches = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);

  const batches = await Batch.find({ isActive: true })
    .skip(skip)
    .limit(limit)
    .sort({ year: -1 });

  // Get alumni count for each batch
  const batchesWithCount = await Promise.all(
    batches.map(async (batch) => {
      const alumniCount = await User.countDocuments({
        batch: batch._id,
        isActive: true,
      });
      return {
        ...batch.toObject(),
        alumniCount,
      };
    })
  );

  const total = await Batch.countDocuments({ isActive: true });
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { batches: batchesWithCount },
    pagination,
    "Batches retrieved successfully"
  );
});

// Get single batch by ID
export const getBatchById = asyncHandler(async (req, res, next) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return next(new AppError("Batch not found", 404));
  }

  // Get alumni from this batch
  const alumni = await User.find({ batch: batch._id, isActive: true })
    .select("-password")
    .sort({ firstName: 1 });

  sendSuccess(res, 200, { batch, alumni }, "Batch retrieved successfully");
});

// Create new batch (Admin only)
export const createBatch = asyncHandler(async (req, res, next) => {
  const { year, name, passoutYear, totalStudents, groupPhoto, description } =
    req.body;

  // Check if batch already exists
  const batchExists = await Batch.findOne({ year });
  if (batchExists) {
    return next(new AppError("Batch with this year already exists", 400));
  }

  const batch = await Batch.create({
    year,
    name,
    passoutYear,
    totalStudents,
    groupPhoto,
    description,
  });

  sendSuccess(res, 201, { batch }, "Batch created successfully");
});

// Update batch (Admin only)
export const updateBatch = asyncHandler(async (req, res, next) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return next(new AppError("Batch not found", 404));
  }

  const {
    name,
    passoutYear,
    totalStudents,
    groupPhoto,
    description,
    reunions,
    achievements,
  } = req.body;

  if (name) batch.name = name;
  if (passoutYear) batch.passoutYear = passoutYear;
  if (totalStudents !== undefined) batch.totalStudents = totalStudents;
  if (groupPhoto !== undefined) batch.groupPhoto = groupPhoto;
  if (description !== undefined) batch.description = description;
  if (reunions) batch.reunions = reunions;
  if (achievements) batch.achievements = achievements;

  await batch.save();

  sendSuccess(res, 200, { batch }, "Batch updated successfully");
});

// Delete batch (Admin only - soft delete)
export const deleteBatch = asyncHandler(async (req, res, next) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return next(new AppError("Batch not found", 404));
  }

  batch.isActive = false;
  await batch.save();

  sendSuccess(res, 200, null, "Batch deleted successfully");
});

// Add reunion to batch
export const addReunion = asyncHandler(async (req, res, next) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return next(new AppError("Batch not found", 404));
  }

  const { date, location, attendees, photos, description } = req.body;

  batch.reunions.push({
    date,
    location,
    attendees,
    photos,
    description,
  });

  await batch.save();

  sendSuccess(res, 200, { batch }, "Reunion added successfully");
});
