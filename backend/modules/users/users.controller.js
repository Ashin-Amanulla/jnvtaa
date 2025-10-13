import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import User from "./users.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

// Get all users with filtering and pagination
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { batch, currentCity, profession, industry, search } = req.query;

  // Build query
  const query = { isActive: true };

  if (batch) query.batch = batch;
  if (currentCity) query.currentCity = new RegExp(currentCity, "i");
  if (profession) query.profession = new RegExp(profession, "i");
  if (industry) query.industry = new RegExp(industry, "i");
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, "i") },
      { lastName: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
  }

  // Execute query
  const users = await User.find(query)
    .populate("batch")
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { users },
    pagination,
    "Users retrieved successfully"
  );
});

// Get single user by ID
export const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate("batch");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Remove sensitive fields based on privacy settings
  const userData = user.toObject();
  if (!userData.privacySettings.showEmail) delete userData.email;
  if (!userData.privacySettings.showPhone) delete userData.phone;
  if (!userData.privacySettings.showLocation) {
    delete userData.currentCity;
    delete userData.currentCountry;
  }
  if (!userData.privacySettings.showProfession) {
    delete userData.profession;
    delete userData.company;
    delete userData.industry;
  }

  sendSuccess(res, 200, { user: userData }, "User retrieved successfully");
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    avatar,
    bio,
    currentCity,
    currentCountry,
    profession,
    company,
    industry,
    socialLinks,
    privacySettings,
  } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update allowed fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;
  if (gender) user.gender = gender;
  if (avatar !== undefined) user.avatar = avatar;
  if (bio !== undefined) user.bio = bio;
  if (currentCity !== undefined) user.currentCity = currentCity;
  if (currentCountry !== undefined) user.currentCountry = currentCountry;
  if (profession !== undefined) user.profession = profession;
  if (company !== undefined) user.company = company;
  if (industry !== undefined) user.industry = industry;
  if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
  if (privacySettings)
    user.privacySettings = { ...user.privacySettings, ...privacySettings };

  await user.save();
  await user.populate("batch");

  sendSuccess(res, 200, { user }, "Profile updated successfully");
});

// Delete user account (soft delete)
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isActive = false;
  await user.save();

  sendSuccess(res, 200, null, "Account deactivated successfully");
});

// Admin: Verify user
export const verifyUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isVerified = true;
  await user.save();

  sendSuccess(res, 200, { user }, "User verified successfully");
});

// Admin: Get all unverified users
export const getUnverifiedUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);

  const users = await User.find({ isVerified: false, isActive: true })
    .populate("batch")
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments({
    isVerified: false,
    isActive: true,
  });
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { users },
    pagination,
    "Unverified users retrieved successfully"
  );
});

// Get user statistics
export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ isActive: true });
  const verifiedUsers = await User.countDocuments({
    isVerified: true,
    isActive: true,
  });
  const unverifiedUsers = await User.countDocuments({
    isVerified: false,
    isActive: true,
  });

  // Users by batch
  const usersByBatch = await User.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$batch", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Users by location
  const usersByLocation = await User.aggregate([
    { $match: { isActive: true, currentCity: { $ne: null } } },
    { $group: { _id: "$currentCity", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  sendSuccess(
    res,
    200,
    {
      stats: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        usersByBatch,
        usersByLocation,
      },
    },
    "Statistics retrieved successfully"
  );
});
