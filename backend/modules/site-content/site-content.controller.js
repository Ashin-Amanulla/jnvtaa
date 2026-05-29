import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import SiteContent from "./site-content.model.js";
import { sendSuccess } from "../../helpers/response.js";

export const getContentByKey = asyncHandler(async (req, res, next) => {
  const content = await SiteContent.findOne({
    key: req.params.key.toLowerCase(),
  }).select("-__v");

  if (!content) {
    return next(new AppError(`Content not found for key: ${req.params.key}`, 404));
  }

  sendSuccess(res, 200, { content }, "Site content retrieved successfully");
});

export const getAllContent = asyncHandler(async (req, res) => {
  const contents = await SiteContent.find()
    .populate("updatedBy", "firstName lastName email")
    .sort({ key: 1 });

  sendSuccess(res, 200, { contents }, "All site content retrieved successfully");
});

export const upsertContent = asyncHandler(async (req, res, next) => {
  const key = req.params.key.toLowerCase();
  const { data } = req.body;

  if (data === undefined) {
    return next(new AppError("Content data is required", 400));
  }

  const content = await SiteContent.findOneAndUpdate(
    { key },
    { key, data, updatedBy: req.user.id },
    { new: true, upsert: true, runValidators: true }
  ).populate("updatedBy", "firstName lastName email");

  sendSuccess(res, 200, { content }, "Site content updated successfully");
});
