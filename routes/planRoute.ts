import express from "express";

import validateRequest from "../middleware/validation";
import { planSchema, updatePlanSchema } from "../utils/schema";
import {
  createPlan,
  deletePlan,
  getAllPlans,
  updatePlan,
} from "../controller/planController";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post(
  "/",
  validateRequest(planSchema),
  autheticateMember("director"),
  createPlan
);
router.patch(
  "/",
  validateRequest(updatePlanSchema),
  autheticateMember("director"),
  updatePlan
);

router.delete("/", autheticateMember("director"), deletePlan);

router.get("/", getAllPlans);

export default router;
