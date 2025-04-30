import express from "express";

import validateRequest from "../middleware/validation";
import { adminSchema } from "../utils/schema";
import * as directorController from "../controller/directorController";

import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.get("/", autheticateMember("director"), directorController.getMember);

export default router;
