import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  refreshToken,
} from "./auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
} from "../../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/me", protect, getMe);
router.put(
  "/update-password",
  protect,
  validate(updatePasswordSchema),
  updatePassword
);

export default router;
