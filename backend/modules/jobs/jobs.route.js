import express from "express";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getMyJobs,
  getAppliedJobs,
} from "./jobs.controller.js";
import { protect, optionalProtect } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { createJobSchema, updateJobSchema } from "../../validators/jobs.validator.js";

const router = express.Router();

// Public routes
router.get("/", optionalProtect, getAllJobs);

// Protected routes (must be before /:id)
router.get("/my/posted", protect, getMyJobs);
router.get("/my/applied", protect, getAppliedJobs);
router.post("/", protect, validate(createJobSchema), createJob);
router.put("/:id", protect, validate(updateJobSchema), updateJob);
router.delete("/:id", protect, deleteJob);
router.post("/:id/apply", protect, applyToJob);

router.get("/:id", getJobById);

export default router;
