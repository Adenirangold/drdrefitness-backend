import express from "express";
import * as memberController from "../controller/memberController";
import validateRequest from "../middleware/validation";
import {
  currentSubscriptionSchema,
  memberUpdateSchema,
  passwordUpdateSchema,
} from "../utils/schema";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.get("/", autheticateMember("member"), memberController.getMember);

router.patch(
  "/",
  validateRequest(memberUpdateSchema),
  autheticateMember("member"),
  memberController.updateMember
);

router.patch(
  "/password",
  validateRequest(passwordUpdateSchema),
  autheticateMember("member"),
  memberController.updateMemberPassword
);

export default router;
