import jwt from "jsonwebtoken";
import { AppError, asyncHandler } from "./error.middleware.js";
import User from "../modules/users/users.model.js";
import authConfig from "../config/auth.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    // Check for token in cookies
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, authConfig.jwt.secret);

    // Get user from token
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return next(new AppError("User no longer exists", 401));
    }

    if (!req.user.isActive) {
      return next(new AppError("Your account has been deactivated", 401));
    }

    next();
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401));
  }
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export const verifyAlumni = asyncHandler(async (req, res, next) => {
  if (!req.user.isVerified) {
    return next(
      new AppError("Your account needs to be verified by admin", 403)
    );
  }
  next();
});
