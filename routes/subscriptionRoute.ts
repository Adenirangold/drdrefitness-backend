import express from "express";
import validateRequest from "../middleware/validation";
import { currentSubscriptionSchema } from "../utils/schema";
import {
  confirmSubscriptionPayment,
  reactivateSubscription,
} from "../controller/subscriptionController";
import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.patch(
  "/",
  validateRequest(currentSubscriptionSchema),
  autheticateMember("member"),
  reactivateSubscription
);
router.get(
  "/verify-payment/:reference",
  autheticateMember("member"),
  confirmSubscriptionPayment
);

export default router;
2;
