import express from "express";
import {
  getActiveCampaign,
  getLeaderboard,
  registerStudent,
  getMatchesForStudent,
  submitStudentPrediction,
  getMyAlumniPredictions,
  submitAlumniPrediction,
  createCampaign,
  updateCampaign,
  createMatch,
  updateMatch,
  deleteMatch,
  enterMatchResult,
  listStudents,
  deleteStudent,
} from "./fifa.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  studentRegisterSchema,
  studentLookupSchema,
  studentPredictSchema,
  alumniPredictSchema,
  campaignSchema,
  updateCampaignSchema,
  matchSchema,
  updateMatchSchema,
  matchResultSchema,
} from "../../validators/fifa.validator.js";

const router = express.Router();

// Public routes
router.get("/campaign", getActiveCampaign);
router.get("/leaderboard", getLeaderboard);

// Student (no account) — identified by roll number + email
router.post("/students/register", validate(studentRegisterSchema), registerStudent);
router.post("/students/matches", validate(studentLookupSchema), getMatchesForStudent);
router.post("/students/predict", validate(studentPredictSchema), submitStudentPrediction);

// Alumni (authenticated)
router.get("/me/predictions", protect, getMyAlumniPredictions);
router.post("/me/predict", protect, validate(alumniPredictSchema), submitAlumniPrediction);

// Admin
const fifaAdmin = [protect, hasPermission(PERMISSIONS.FIFA_MANAGE)];

router.post("/admin/campaign", ...fifaAdmin, validate(campaignSchema), createCampaign);
router.put("/admin/campaign/:id", ...fifaAdmin, validate(updateCampaignSchema), updateCampaign);

router.post("/admin/matches", ...fifaAdmin, validate(matchSchema), createMatch);
router.put("/admin/matches/:id", ...fifaAdmin, validate(updateMatchSchema), updateMatch);
router.delete("/admin/matches/:id", ...fifaAdmin, deleteMatch);
router.put(
  "/admin/matches/:id/result",
  ...fifaAdmin,
  validate(matchResultSchema),
  enterMatchResult
);

router.get("/admin/students", ...fifaAdmin, listStudents);
router.delete("/admin/students/:id", ...fifaAdmin, deleteStudent);

export default router;
