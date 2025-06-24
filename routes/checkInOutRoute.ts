import express from "express";

import validateRequest from "../middleware/validation";
import { checkInOutSchema } from "../utils/schema";
import autheticateMember from "../middleware/authentication";
import * as checkInOutController from "../controller/checkInOutController";

const router = express.Router();

router.post(
  "/scan",
  validateRequest(checkInOutSchema),
  autheticateMember("member"),
  checkInOutController.scanMember
);
router.get(
  "/records/:gymLocation/:gymBranch",
  autheticateMember("admin"),
  checkInOutController.getCheckInOutMember
);

export default router;
