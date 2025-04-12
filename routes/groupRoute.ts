import express from "express";
import validateRequest from "../middleware/validation";
import {
  emailAloneSchema,
  groupMemberSchema,
  idOnlySchema,
} from "../utils/schema";
import * as groupController from "../controller/groupController";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post(
  "/",

  validateRequest(emailAloneSchema),
  autheticateMember("member"),
  groupController.sendGroupInvitation
);

router.delete(
  "/:id",
  autheticateMember("member"),
  groupController.removeDependant
);

router.post(
  "/:token/:id",

  validateRequest(groupMemberSchema),
  groupController.acceptGroupInvitation
);
export default router;
