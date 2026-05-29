import multer from "multer";
import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import { sendSuccess } from "../../helpers/response.js";
import {
  createPresignedUploadUrl,
  uploadBufferToS3,
} from "../../services/upload.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadMiddleware = upload.single("file");

export const signUpload = asyncHandler(async (req, res, next) => {
  const { fileName, contentType, folder } = req.body;

  if (!fileName) {
    return next(new AppError("fileName is required", 400));
  }

  try {
    const signed = await createPresignedUploadUrl({
      fileName,
      contentType,
      folder,
    });

    sendSuccess(res, 200, signed, "Presigned upload URL generated");
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

export const directUpload = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("File is required", 400));
  }

  const folder = req.body.folder || "uploads";

  try {
    const result = await uploadBufferToS3({
      buffer: req.file.buffer,
      fileName: req.file.originalname,
      contentType: req.file.mimetype,
      folder,
    });

    sendSuccess(res, 201, { upload: result }, "File uploaded successfully");
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});
