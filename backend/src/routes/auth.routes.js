import express from "express";
import authController from "../controllers/auth.controller.js";
import {
  validate,
  validationSchemas,
} from "../middleware/validation.middleware.js";

import authMiddleware from "../middleware/auth.middleware.js";
import { authValidation } from "../utils/validator.js";

const router = express.Router();

router.post(
  "/register",
  validate(validationSchemas.user.register),
  authController.register
);
router.post(
  "/login",
  validate(validationSchemas.user.login),
  authController.login
);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authMiddleware, authController.logout);
router.post(
  "/forgot-password",
  validate(validationSchemas.user.forgotPassword),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(validationSchemas.user.resetPassword),
  authController.resetPassword
);
router.post("/verify-email", authController.verifyEmail);

export default router;
