import express from "express";
import validateRequest from "../middleware/validation";
import { currentSubscriptionSchema } from "../utils/schema";
import {
  cancelSubscription,
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

router.delete("/", autheticateMember("member"), cancelSubscription);

export default router;
2;
