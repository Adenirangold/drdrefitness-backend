import express from "express";
import validateRequest from "../middleware/validation";
import { currentSubscriptionSchema } from "../utils/schema";
import { reactivateSubscription } from "../controller/subscriptionController";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.patch(
  "/",
  validateRequest(currentSubscriptionSchema),
  autheticateMember("member"),
  reactivateSubscription
);

export default router;
2;
