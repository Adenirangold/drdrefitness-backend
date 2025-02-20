import express from "express";
import {
  handlePaystackWebhook,
  initializePayment,
  verifyPayment,
} from "../controller/paystackController";

const router = express.Router();

router.post("/initialize", initializePayment);
router.get("/verifyPayment/:reference", verifyPayment);

router.post(
  "/webhook/paystack",
  express.raw({ type: "application/json" }),
  handlePaystackWebhook
);

export default router;
