import express from "express";
import {
  signUpload,
  directUpload,
  uploadMiddleware,
} from "./uploads.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/sign", signUpload);
router.post("/", uploadMiddleware, directUpload);

export default router;
