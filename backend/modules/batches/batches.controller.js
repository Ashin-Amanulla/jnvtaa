import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import Batch from "./batches.model.js";
import User from "../users/users.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";
import {
  getOrSet,
  bustBatchesCache,
  CACHE_KEYS,
  CACHE_TTL,
} from "../../helpers/cache.js";

async function fetchBatchesWithCounts(page, limit, skip) {
  const batches = await Batch.find({ isActive: true })
    .skip(skip)
    .limit(limit)
    .sort({ year: -1 })
    .lean();

  const batchIds = batches.map((batch) => batch._id);

  const counts =
    batchIds.length > 0
      ? await User.aggregate([
          { $match: { batch: { $in: batchIds }, isActive: true } },
          { $group: { _id: "$batch", count: { $sum: 1 } } },
        ])
      : [];

  const countMap = Object.fromEntries(
    counts.map((entry) => [entry._id.toString(), entry.count])
  );

  const batchesWithCount = batches.map((batch) => ({
    ...batch,
    alumniCount: countMap[batch._id.toString()] || 0,
  }));

  const total = await Batch.countDocuments({ isActive: true });
  const pagination = getPaginationMeta(total, page, limit);

  return { batches: batchesWithCount, pagination };
}

export const getAllBatches = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const cacheKey = CACHE_KEYS.batchesList(page, limit);

  const cached = await getOrSet(cacheKey, CACHE_TTL.BATCHES, () =>
    fetchBatchesWithCounts(page, limit, skip)
  );

  sendPaginated(
    res,
    200,
    { batches: cached.batches },
    cached.pagination,
    "Batches retrieved successfully"
  );
});

export const getBatchById = asyncHandler(async (req, res, next) => {
  const cacheKey = CACHE_KEYS.batch(req.params.id);

  const cached = await getOrSet(cacheKey, CACHE_TTL.BATCHES, async () => {
    const batch = await Batch.findById(req.params.id).lean();

    if (!batch) {
      return null;
    }

    const alumni = await User.find({ batch: batch._id, isActive: true })
      .select("-password")
      .sort({ firstName: 1 })
      .lean();

    return { batch, alumni };
  });

  if (!cached) {
    return next(new AppError("Batch not found", 404));
  }

  sendSuccess(res, 200, cached, "Batch retrieved successfully");
});

export const createBatch = asyncHandler(async (req, res, next) => {
  const { year, name, passoutYear, totalStudents, groupPhoto, description } =
    req.body;

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

  await bustBatchesCache();

  sendSuccess(res, 201, { batch }, "Batch created successfully");
});

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
  await bustBatchesCache(batch._id.toString());

  sendSuccess(res, 200, { batch }, "Batch updated successfully");
});

export const deleteBatch = asyncHandler(async (req, res, next) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return next(new AppError("Batch not found", 404));
  }

  batch.isActive = false;
  await batch.save();
  await bustBatchesCache(batch._id.toString());

  sendSuccess(res, 200, null, "Batch deleted successfully");
});

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
  await bustBatchesCache(batch._id.toString());

  sendSuccess(res, 200, { batch }, "Reunion added successfully");
});
