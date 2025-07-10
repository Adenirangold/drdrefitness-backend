import express from "express";

import validateRequest from "../middleware/validation";
import { updateAdminSchema } from "../utils/schema";
import * as couponController from "../controller/couponController";

import autheticateMember from "../middleware/authentication";

const router = express.Router();

router.post("/", autheticateMember("director"), couponController.createCoupon);
router.get("/", autheticateMember("director"), couponController.getAllCoupons);

router.put(
  "/:couponId",
  autheticateMember("director"),
  validateRequest(updateAdminSchema),
  couponController.updateCoupon
);
router.delete(
  "/:couponId",
  autheticateMember("director"),
  couponController.deleteCoupon
);

export default router;
