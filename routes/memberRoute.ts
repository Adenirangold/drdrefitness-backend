import express from "express";
import * as authController from "../controller/authController";
import validateRequest from "../middleware/validation";
import { loginSchema, memberSchema } from "../utils/schema";

const router = express.Router();

router.post("/signup", validateRequest(memberSchema), authController.signup);

router.post("/login", validateRequest(loginSchema), authController.login);

export default router;
