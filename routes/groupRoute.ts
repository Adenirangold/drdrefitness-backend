import express from "express";
import validateRequest from "../middleware/validation";
import { emailAloneSchema } from "../utils/schema";
import * as groupController from "../controller/groupController";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post(
  "/",

  validateRequest(emailAloneSchema),
  autheticateMember("member"),
  groupController.sendGroupInvitation
);
export default router;
