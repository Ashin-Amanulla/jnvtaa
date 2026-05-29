import express from "express";
import {
  getMentors,
  becomeMentor,
  updateMentorProfile,
  getMyRequests,
  createMentorshipRequest,
  respondToRequest,
  getAdminMentorProfiles,
  approveMentorProfile,
} from "./mentorship.controller.js";
import {
  protect,
  verifyAlumni,
  hasPermission,
} from "../../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../../config/roles.js";

const router = express.Router();

router.get("/mentors", getMentors);

router.get(
  "/admin/profiles",
  protect,
  hasPermission(PERMISSIONS.MENTORSHIP_MANAGE),
  getAdminMentorProfiles
);
router.put(
  "/admin/profiles/:id/approve",
  protect,
  hasPermission(PERMISSIONS.MENTORSHIP_MANAGE),
  approveMentorProfile
);

router.use(protect);

router.post("/become-mentor", verifyAlumni, becomeMentor);
router.put("/profile", updateMentorProfile);
router.get("/requests", getMyRequests);
router.post("/request/:mentorId", verifyAlumni, createMentorshipRequest);
router.put("/requests/:id/respond", respondToRequest);

export default router;
