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
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllJobs);
router.get("/:id", getJobById);

// Protected routes
router.post("/", protect, createJob);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);
router.post("/:id/apply", protect, applyToJob);
router.get("/my/posted", protect, getMyJobs);
router.get("/my/applied", protect, getAppliedJobs);

export default router;
