import express from "express";
import validateRequest from "../middleware/validation";
import { emailAloneSchema } from "../utils/schema";
import * as authController from "../controller/authController";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post(
  "/",

  validateRequest(emailAloneSchema),
  autheticateMember("member"),

  authController.signup
);
export default router;
