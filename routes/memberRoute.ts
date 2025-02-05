import express from "express";
import * as authController from "../controller/authController";
import * as memberController from "../controller/memberController";
import validateRequest from "../middleware/validation";
import { loginSchema, memberSchema } from "../utils/schema";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post("/signup", validateRequest(memberSchema), authController.signup);

router.post("/login", validateRequest(loginSchema), authController.login);

router.get("/", autheticateMember("admin"), memberController.getMember);

export default router;
