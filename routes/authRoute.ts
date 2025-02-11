import express from "express";
import validateRequest from "../middleware/validation";
import {
  forgotPasswordSchema,
  loginSchema,
  memberSchema,
  passwordresetSchema,
} from "../utils/schema";
import * as authController from "../controller/authController";

const router = express.Router();

router.post("/signup", validateRequest(memberSchema), authController.signup);

router.post("/login", validateRequest(loginSchema), authController.login);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

router.patch(
  "/reset-password/:token",
  validateRequest(passwordresetSchema),
  authController.resetPassword
);

export default router;
