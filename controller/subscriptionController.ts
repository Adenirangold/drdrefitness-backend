import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";
import Plan from "../models/plan";
import { paystackInitializePayment } from "../config/paystack";

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

    // //////////////payment////
    const paymentResponse = await paystackInitializePayment(
      req.user.email,
      existingPlan.price,
      {
        phoneNumber: req.user.phoneNumber,
        lastName: req.user.lastName,
        firstName: req.user.firstName,
      }
    );

    const newSubscription = {
      ...req.body,
    };

    const member = await Member.findById(currentMember._id);

    if (!member) {
      return next(new AppError("This member does not exist", 404));
    }

    member.currentSubscription = newSubscription;

    const updatedMember = member.save();

    res.status(200).json({
      status: "success",
      message: "subscription sucessfull",
    });
  } catch (error) {
    next(error);
  }
};
export const confirmSubscriptionPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
