import express from "express";

import validateRequest from "../middleware/validation";
import { couponSchema } from "../utils/schema";
import * as couponController from "../controller/couponController";

import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post(
  "/",
  autheticateMember("director"),
  validateRequest(couponSchema),
  couponController.createCoupon
);
router.get("/", autheticateMember("director"), couponController.getAllCoupons);

router.put(
  "/:couponId",
  autheticateMember("director"),
  validateRequest(couponSchema),
  couponController.updateCoupon
);
router.delete(
  "/:couponId",
  autheticateMember("director"),
  couponController.deleteCoupon
);

export default router;
