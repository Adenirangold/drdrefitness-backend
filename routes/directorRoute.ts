import express from "express";

import validateRequest from "../middleware/validation";
import { updateAdminSchema } from "../utils/schema";
import * as directorController from "../controller/directorController";

import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.get("/", autheticateMember("director"), directorController.getMember);
router.get(
  "/admin",
  autheticateMember("director"),
  directorController.getAdmin
);
router.patch(
  "/admin/:id",
  autheticateMember("director"),
  validateRequest(updateAdminSchema),
  directorController.updateAdmin
);
router.delete(
  "/admin/:id",
  autheticateMember("director"),
  directorController.deleteAdmin
);

export default router;
