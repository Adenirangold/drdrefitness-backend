import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import CheckInStation from "../models/checkInStation";
import Plan from "../models/plan";

export const scanMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const member = req.user;

    const { token, stationId } = req.body;
    const station = await CheckInStation.findOne({
      _id: stationId,
      qrCodeToken: token,
    });
    if (!station || !station.qrCodeCreatedAt) {
      return next(new AppError("Invalid or expired QR code", 400));
    }

    const subscription = member.currentSubscription;
    const plan = subscription?.plan
      ? await Plan.findById(subscription.plan._id)
      : null;

    if (
      !subscription ||
      subscription.subscriptionStatus !== "active" ||
      !plan ||
      plan.gymBranch !== station.gymBranch ||
      plan.gymLocation !== station.gymLocation
    ) {
      return next(new AppError("No active subscription for this branch", 403));
    }

    res.status(200).json({
      status: "success",
      member,
    });
  } catch (error) {
    next(error);
  }
};
