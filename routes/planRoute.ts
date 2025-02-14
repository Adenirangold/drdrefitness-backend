import express from "express";

import validateRequest from "../middleware/validation";
import { planSchema } from "../utils/schema";
import { createPlan } from "../controller/planController";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post(
  "/",
  validateRequest(planSchema),
  autheticateMember("director"),
  createPlan
);

export default router;
