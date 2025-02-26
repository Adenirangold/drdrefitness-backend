import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";
import Plan from "../models/plan";
import {
  paystackInitializePayment,
  paystackVerifyPayment,
} from "../config/paystack";
import { sendWelcomeEmail } from "../config/email";

export const reactivateSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentMember = req.user;
    if (!currentMember) {
      return next(new AppError("Unauthorised", 401));
    }

    const existingPlan = await Plan.findById(req.body.plan);
    if (!existingPlan) {
      return next(
        new AppError("Plan for this subscription no longer exist", 404)
      );
    }

    const paymentResponse = await paystackInitializePayment(
      req.user.email,
      existingPlan.price,
      {
        phoneNumber: req.user.phoneNumber,
        lastName: req.user.lastName,
        firstName: req.user.firstName,
      }
    );

    const updatedMember = await Member.findByIdAndUpdate(
      req.user._id,
      {
        currentSubscription: {
          transactionReference: paymentResponse.data.data.reference,
          plan: existingPlan._id,
          startDate: req.body.startDate,
          subscriptionStatus: "inactive",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        authorizationUrl: paymentResponse.data.data.authorization_url,
        reference: paymentResponse.data.data.reference,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const confirmSubscriptionPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { reference } = req.params;

  const verificationResponse = await paystackVerifyPayment(reference);

  if (
    !verificationResponse.status ||
    verificationResponse.status !== "success"
  ) {
    return next(new AppError("Payment verification failed", 400));
  }

  const member = await Member.findOne({
    "currentSubscription.transactionReference": reference,
  });

  if (!member) {
    return next(new AppError("Member not found", 404));
  }

  member.isActive = true;
  member.currentSubscription = {
    ...member.currentSubscription,
    paymentMethod: verificationResponse.payment_type || "card",
    subscriptionStatus: "active",
    paymentStatus:
      verificationResponse.status === "success" ? "approved" : "declined",

    startDate: new Date(),
    autoRenew: false,
  };

  await member.save();

  await sendWelcomeEmail(
    "adeniranbayogold@gmail.com",
    `${member.firstName}${" "}${member.lastName}`
  );

  res.status(200).json({
    status: "success",
    message: "subscription reactivation sucessfull",
  });
};
export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
