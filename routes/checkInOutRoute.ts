import express from "express";

import validateRequest from "../middleware/validation";
import { checkInOutSchema } from "../utils/schema";
import autheticateMember from "../middleware/authentication";
import { scanMember } from "../controller/checkInOutController";

const router = express.Router();

router.post(
  "/scan",
  validateRequest(checkInOutSchema),
  autheticateMember("member"),
  scanMember
);

export default router;
