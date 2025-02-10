import express from "express";
import * as authController from "../controller/authController";
import * as memberController from "../controller/memberController";
import validateRequest from "../middleware/validation";
import {
  forgotPasswordSchema,
  loginSchema,
  memberSchema,
  memberUpdateSchema,
  passwordresetSchema,
  passwordUpdateSchema,
} from "../utils/schema";
import autheticateMember from "../middleware/authentication";

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

// ///////'//////////////AUTHENTICATED MEMBER ONLY ROUTES////////////////////

router.get("/", autheticateMember("member"), memberController.getMember);

router.patch(
  "/update",
  validateRequest(memberUpdateSchema),
  autheticateMember("member"),
  memberController.updateMember
);

router.patch(
  "/update-password",
  validateRequest(passwordUpdateSchema),
  autheticateMember("member"),
  memberController.updateMemberPassword
);
console.log("heyyy");

export default router;
