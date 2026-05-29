import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import User from "./users.model.js";
import { sendSuccess, sendPaginated } from "../../helpers/response.js";
import { ROLES } from "../../config/roles.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

// Get all users with filtering and pagination
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { batch, currentCity, profession, industry, search } = req.query;

  // Build query — alumni directory only (exclude platform super admin)
  const query = { isActive: true, role: { $ne: ROLES.SUPER_ADMIN } };

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

  if (user.role === ROLES.SUPER_ADMIN) {
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
  const alumniFilter = { isActive: true, role: { $ne: ROLES.SUPER_ADMIN } };
  const totalUsers = await User.countDocuments(alumniFilter);
  const verifiedUsers = await User.countDocuments({
    ...alumniFilter,
    isVerified: true,
  });
  const unverifiedUsers = await User.countDocuments({
    ...alumniFilter,
    isVerified: false,
  });

  // Users by batch
  const usersByBatch = await User.aggregate([
    { $match: { ...alumniFilter } },
    { $group: { _id: "$batch", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Users by location
  const usersByLocation = await User.aggregate([
    { $match: { ...alumniFilter, currentCity: { $ne: null } } },
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

// Admin: List all users with filters
export const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const {
    role,
    isVerified,
    isActive,
    batch,
    search,
    currentCity,
    currentCountry,
    profession,
    company,
    industry,
    gender,
    staffOnly,
    membersOnly,
  } = req.query;

  const query = { role: { $ne: ROLES.SUPER_ADMIN } };

  if (staffOnly === "true") {
    query.role = { $nin: [ROLES.MEMBER, ROLES.SUPER_ADMIN] };
  } else if (membersOnly === "true") {
    query.role = ROLES.MEMBER;
  } else if (role && role !== ROLES.SUPER_ADMIN) {
    query.role = role;
  }
  if (isVerified !== undefined && isVerified !== "")
    query.isVerified = isVerified === "true";
  if (isActive !== undefined && isActive !== "")
    query.isActive = isActive === "true";
  if (batch) query.batch = batch;
  if (currentCity) query.currentCity = new RegExp(currentCity, "i");
  if (currentCountry) query.currentCountry = new RegExp(currentCountry, "i");
  if (profession) query.profession = new RegExp(profession, "i");
  if (company) query.company = new RegExp(company, "i");
  if (industry) query.industry = new RegExp(industry, "i");
  if (gender) query.gender = gender;
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, "i") },
      { lastName: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { profession: new RegExp(search, "i") },
      { company: new RegExp(search, "i") },
    ];
  }

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

// Super admin: Change user role
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user._id.toString() === req.user.id) {
    return next(new AppError("You cannot change your own role", 400));
  }

  if (role === ROLES.SUPER_ADMIN) {
    return next(
      new AppError("Super admin accounts are platform-only and cannot be assigned", 403)
    );
  }

  if (
    user.role === ROLES.SUPER_ADMIN &&
    role !== ROLES.SUPER_ADMIN
  ) {
    const superAdminCount = await User.countDocuments({
      role: ROLES.SUPER_ADMIN,
      isActive: true,
    });
    if (superAdminCount <= 1) {
      return next(
        new AppError("Cannot demote the last active super admin", 400)
      );
    }
  }

  user.role = role;
  await user.save();
  await user.populate("batch");

  sendSuccess(res, 200, { user }, "User role updated successfully");
});

// Admin: Deactivate user
export const deactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user._id.toString() === req.user.id) {
    return next(new AppError("You cannot deactivate your own account", 400));
  }

  user.isActive = false;
  await user.save();
  await user.populate("batch");

  sendSuccess(res, 200, { user }, "User deactivated successfully");
});

// Admin/Moderator: Edit user profile
export const adminUpdateUser = asyncHandler(async (req, res, next) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "batch",
    "rollNumber",
    "dateOfBirth",
    "gender",
    "avatar",
    "bio",
    "currentCity",
    "currentCountry",
    "profession",
    "company",
    "industry",
    "isVerified",
    "isActive",
    "socialLinks",
    "privacySettings",
  ];

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === "socialLinks" || field === "privacySettings") {
        user[field] = { ...user[field], ...req.body[field] };
      } else {
        user[field] = req.body[field];
      }
    }
  }

  if (req.body.role !== undefined) {
    return next(
      new AppError("Role changes must use the dedicated role endpoint", 403)
    );
  }

  await user.save();
  await user.populate("batch");

  sendSuccess(res, 200, { user }, "User updated successfully");
});
