import express from "express";
import validateRequest from "../middleware/validation";

import * as authController from "../controller/authController";

const router = express.Router();

router.get("/", () => {});

export default router;
