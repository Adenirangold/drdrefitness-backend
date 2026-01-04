import express from "express";

import validateRequest from "../middleware/validation";
import { adminSchema } from "../utils/schema";
import * as adminController from "../controller/adminController";

import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post(
  "/",
  validateRequest(adminSchema),
  autheticateMember("director"),
  adminController.createAdmin
);

router.get(
  "/",
  autheticateMember("admin"),
  adminController.getAdminBranchMember
  adminController.getAdminBranchMember
  adminController.getAdminBranchMember
  adminController.getAdminBranchMember
  adminController.getAdminBranchMember
  

);

export default router;
