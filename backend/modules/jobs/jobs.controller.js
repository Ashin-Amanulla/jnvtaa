import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import Job from "./jobs.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

// Get all jobs
export const getAllJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { employmentType, experienceLevel, industry, location, search } =
    req.query;

  // Build query
  const query = { isPublished: true, status: "active" };

  if (employmentType) query.employmentType = employmentType;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (industry) query.industry = new RegExp(industry, "i");
  if (location) query["location.city"] = new RegExp(location, "i");
  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { company: new RegExp(search, "i") },
    ];
  }

  // Execute query
  const jobs = await Job.find(query)
    .populate("postedBy", "firstName lastName avatar company")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Job.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(res, 200, { jobs }, pagination, "Jobs retrieved successfully");
});

// Get single job
export const getJobById = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate(
    "postedBy",
    "firstName lastName avatar company profession"
  );

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  // Increment views
  job.views += 1;
  await job.save({ validateBeforeSave: false });

  sendSuccess(res, 200, { job }, "Job retrieved successfully");
});

// Create job
export const createJob = asyncHandler(async (req, res) => {
  const jobData = {
    ...req.body,
    postedBy: req.user.id,
  };

  const job = await Job.create(jobData);
  await job.populate("postedBy", "firstName lastName avatar company");

  sendSuccess(res, 201, { job }, "Job posted successfully");
});

// Update job
export const updateJob = asyncHandler(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  // Check if user is poster or admin
  if (job.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to update this job", 403));
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("postedBy", "firstName lastName avatar company");

  sendSuccess(res, 200, { job }, "Job updated successfully");
});

// Delete job
export const deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  // Check if user is poster or admin
  if (job.postedBy.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to delete this job", 403));
  }

  await job.deleteOne();

  sendSuccess(res, 200, null, "Job deleted successfully");
});

// Apply to job
export const applyToJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  if (job.status !== "active") {
    return next(
      new AppError("This job is no longer accepting applications", 400)
    );
  }

  // Check if already applied
  const alreadyApplied = job.applications.includes(req.user.id);

  if (alreadyApplied) {
    return next(new AppError("You have already applied to this job", 400));
  }

  // Add user to applications
  job.applications.push(req.user.id);
  await job.save();

  sendSuccess(res, 200, { job }, "Application submitted successfully");
});

// Get my posted jobs
export const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user.id }).sort({
    createdAt: -1,
  });

  sendSuccess(res, 200, { jobs }, "Your posted jobs retrieved successfully");
});

// Get jobs I applied to
export const getAppliedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ applications: req.user.id })
    .populate("postedBy", "firstName lastName avatar company")
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, { jobs }, "Applied jobs retrieved successfully");
});
