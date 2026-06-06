import jwt from "jsonwebtoken";
import crypto from "crypto";
import passport from "passport";
import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import User from "../users/users.model.js";
import authConfig from "../../config/auth.js";
import { sendSuccess } from "../../helpers/response.js";
import {
  sendPasswordResetEmail,
  sendRegistrationEmail,
} from "../../services/email.service.js";
import { bustUserStatsAndBatches } from "../../helpers/cache.js";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.expiresIn,
  });
};

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, authConfig.jwt.refreshSecret, {
    expiresIn: authConfig.jwt.refreshExpiresIn,
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Set cookie
  res.cookie("token", token, authConfig.cookie);

  // Remove password from output
  user.password = undefined;

  sendSuccess(
    res,
    statusCode,
    {
      user,
      token,
      refreshToken,
    },
    "Authentication successful"
  );
};

// Register user
export const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, batch, phone, rollNumber } =
    req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("User with this email already exists", 400));
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    batch,
    phone,
    rollNumber,
  });

  // Populate batch information
  await user.populate("batch");

  try {
    await sendRegistrationEmail(user);
  } catch (err) {
    console.error("Registration email failed:", err.message);
  }

  await bustUserStatsAndBatches(user.batch?._id?.toString());

  sendTokenResponse(user, 201, res);
});

// Login user
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email })
    .select("+password")
    .populate("batch");

  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  if (!user.password) {
    return next(
      new AppError("Please sign in with Google for this account", 401)
    );
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated", 401));
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  sendSuccess(res, 200, null, "Logged out successfully");
});

// Get current user
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("batch");
  sendSuccess(res, 200, { user }, "User retrieved successfully");
});

// Update password
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Refresh token
export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("Refresh token is required", 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, authConfig.jwt.refreshSecret);
    const user = await User.findById(decoded.id).populate("batch");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    return next(new AppError("Invalid refresh token", 401));
  }
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return sendSuccess(
      res,
      200,
      null,
      "If that email exists, a reset link has been sent"
    );
  }

  const resetToken = jwt.sign({ id: user._id }, authConfig.jwt.resetSecret, {
    expiresIn: "1h",
  });

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, resetToken);
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Failed to send reset email", 500));
  }

  sendSuccess(res, 200, null, "If that email exists, a reset link has been sent");
});

// Reset password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(token, authConfig.jwt.resetSecret);
  } catch {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    _id: decoded.id,
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Google OAuth callback
export const googleCallback = asyncHandler(async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!req.user) {
    return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }

  req.user.lastLogin = Date.now();
  await req.user.save({ validateBeforeSave: false });
  await req.user.populate("batch");

  const token = generateToken(req.user._id);
  const refreshToken = generateRefreshToken(req.user._id);

  res.redirect(
    `${frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`
  );
});
