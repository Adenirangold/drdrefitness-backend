import express from "express";
import * as authController from "../controller/authController";
import validateRequest from "../middleware/validation";
import { memberSchema } from "../utils/schema";

const router = express.Router();

router.post("/signup", validateRequest(memberSchema), authController.signup);

router.post("/login", validateRequest(memberSchema), authController.login);

export default router;
