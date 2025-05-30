import express from "express";
import validateRequest from "../middleware/validation";
import {
  emailAloneSchema,
  loginSchema,
  memberSchema,
  passwordresetSchema,
  passwordUpdateSchema,
} from "../utils/schema";
import * as authController from "../controller/authController";

const router = express.Router();

router.post("/signup", validateRequest(memberSchema), authController.signup);

router.get(
  "/signup/verify-payment/:reference",
  authController.verifyPaymentAndActivate
);

router.post("/login", validateRequest(loginSchema), authController.login);

router.post(
  "/forgot-password",
  validateRequest(emailAloneSchema),
  authController.forgotPassword
);

router.patch(
  "/reset-password/:token",
  validateRequest(passwordresetSchema),
  authController.resetPassword
);

export default router;
