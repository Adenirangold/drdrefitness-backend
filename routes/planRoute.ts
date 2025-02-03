import express from "express";

import validateRequest from "../middleware/validation";
import { planSchema } from "../utils/schema";

const router = express.Router();

export default router;
