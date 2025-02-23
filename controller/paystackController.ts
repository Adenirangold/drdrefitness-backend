import {
  paystackInitializePayment,
  paystackVerifyPayment,
} from "../config/paystack";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";
import { sendWelcomeEmail } from "../config/email";
import crypto from "crypto";

export const initializePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, amount, phoneNumber, lastName, firstName } = req.body;
    const metadata = { phoneNumber, lastName, firstName };

    if (!email || !amount) {
      next(new AppError("Email and amount are required", 400));
    }

    const response = await paystackInitializePayment(email, amount, metadata);

    if (!response) {
      return next(new AppError("Payment initialization failed", 400));
    }

    res.status(200).json({
      status: "success",
      message: "Payment initialized",
      data: {
        authorizationUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
        accessCode: response.data.data.access_code,
      },
    });
  } catch (error) {
    next(new AppError("Payment initialization failed", 500));
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { reference } = req.params;

  if (!reference) {
    return next(new AppError("No reference supplied", 400));
  }

  try {
    const {
      status,
      gateway_response,
      amount,
      customer,
      metadata,
      transaction_date,
      payment_type,
    } = await paystackVerifyPayment(reference);

    res.json({
      status,
      data: {
        status,
        message: gateway_response,
        amount: amount * 100,
        customer,
        metadata,
        transaction_date,
        reference,
        payment_type,
      },
    });
  } catch (error) {
    next(new AppError("Payment initialization failed", 500));
  }
};

export const handlePaystackWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return next(new AppError("Invalid signature", 400));
    }

    const event = req.body;

    switch (event.event) {
      case "charge.success":
        const { reference, status, payment_type, customer } = event.data;

        const member = await Member.findOneAndUpdate(
          { "currentSubscription.transactionReference": reference },
          {
            isActive: status === "success",
            currentSubscription: {
              paymentMethod: payment_type || "card",
              paymentStatus: status === "success" ? "approved" : "declined",
            },
          },
          { new: true }
        );

        if (member) {
          await sendWelcomeEmail(
            customer.email,
            `${member.firstName}${" "}${member.lastName}`
          );
        }
        break;

      case "charge.failed":
        await Member.findOneAndUpdate(
          { "currentSubscription.transactionReference": event.data.reference },
          {
            "currentSubscription.paymentStatus": "declined",
            isActive: false,
          }
        );
        break;
    }

    res.status(200).json({ status: "success" });
  } catch (error) {
    next(error);
  }
};
