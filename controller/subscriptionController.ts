import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";
import Plan from "../models/plan";
import {
  paystackInitializePayment,
  paystackVerifyPayment,
} from "../config/paystack";
import { sendSubscriptionEmail, sendWelcomeEmail } from "../config/email";
import { formatDate } from "../lib/util";

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

    const { planType, name, gymLocation, gymBranch } = req.body;

    const existingPlan = await Plan.findOne({
      planType,
      name,
      gymLocation,
      gymBranch,
    });
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
        $set: {
          "currentSubscription.transactionReference":
            paymentResponse.data.data.reference,
          "currentSubscription.plan": existingPlan._id,
          "currentSubscription.startDate": new Date(),
          "currentSubscription.subscriptionStatus": "inactive",
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
  }).populate("currentSubscription.plan");

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

  const plan = await Plan.findById(member.currentSubscription.plan);

  await sendSubscriptionEmail(
    "adeniranbayogold@gmail.com",
    `${member.firstName}${" "}${member.lastName}`,
    `${plan?.name || ""}`,
    `${formatDate(member.currentSubscription.endDate!)}`,
    plan?.duration!
  );

  res.status(200).json({
    status: "success",
    message: "subscription reactivation successfull",
  });
};

export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentMember = req.user;

    if (!currentMember) {
      return next(new AppError("Unauthorised", 401));
    }

    if (
      !currentMember.currentSubscription ||
      currentMember.currentSubscription.subscriptionStatus !== "active"
    ) {
      return next(new AppError("No active subscription to cancel", 400));
    }

    const updatedMember = await Member.findByIdAndUpdate(
      currentMember._id,
      {
        $set: {
          isActive: false,
          "currentSubscription.subscriptionStatus": "cancelled",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMember) {
      return next(new AppError("Member not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};
