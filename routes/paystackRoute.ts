import express from "express";
import {
  initializePayment,
  verifyPayment,
} from "../controller/paystackController";

const router = express.Router();

router.post("/initialize", initializePayment);
router.get("/verifyPayment/:reference", verifyPayment);

export default router;
