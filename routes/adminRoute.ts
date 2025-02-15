import express from "express";

import validateRequest from "../middleware/validation";
import { planSchema, updatePlanSchema } from "../utils/schema";

import autheticateMember from "../middleware/authentication";

const router = express.Router();

export default router;
