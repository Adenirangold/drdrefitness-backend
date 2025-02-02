import express from "express";
import * as memberController from "../controller/memberController";
import validateRequest from "../middleware/validation";
import { planSchema } from "../utils/schema";

const router = express.Router();

router.post("/", validateRequest(planSchema), memberController.createMember);

export default router;
