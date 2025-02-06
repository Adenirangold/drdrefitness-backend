import express from "express";
import * as authController from "../controller/authController";
import * as memberController from "../controller/memberController";
import validateRequest from "../middleware/validation";
import {
  loginSchema,
  memberSchema,
  memberUpdateSchema,
  passwordUpdateSchema,
} from "../utils/schema";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post("/signup", validateRequest(memberSchema), authController.signup);

router.post("/login", validateRequest(loginSchema), authController.login);

router.get("/", autheticateMember("user"), memberController.getMember);

router.patch(
  "/update",
  validateRequest(memberUpdateSchema),
  autheticateMember("user"),
  memberController.updateMember
);

router.patch(
  "/update-password",
  validateRequest(passwordUpdateSchema),
  autheticateMember("user"),
  memberController.updateMemberPassword
);

export default router;
