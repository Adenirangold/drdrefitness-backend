import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Plan from "../models/plan";
import Coupon from "../models/coupons";

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      applicablePlans,
      validFrom,
      validUntil,
      maxUses,
    } = req.body;

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      applicablePlans,
      validFrom,
      validUntil,
      maxUses,
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponId } = req.params;
    const {
      code,
      discountType,
      discountValue,
      applicablePlans,
      validFrom,
      validUntil,
      maxUses,
    } = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return next(new AppError("Coupon not found", 404));
    }

    // Validate plan IDs
    if (applicablePlans) {
      const plans = await Plan.find({ _id: { $in: applicablePlans } });
      if (plans.length !== applicablePlans.length) {
        return next(new AppError("One or more plan IDs are invalid", 400));
      }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        code,
        discountType,
        discountValue,
        applicablePlans,
        validFrom,
        validUntil,
        maxUses,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: updatedCoupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponId } = req.params;
    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      return next(new AppError("Coupon not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupons = await Coupon.find().populate("applicablePlans");
    res.status(200).json({
      status: "success",
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

// Example route usage in your Express app
// import { createCoupon, updateCoupon, deleteCoupon, getAllCoupons } from "./couponRoutes";
// app.post("/coupons", isDirector, createCoupon);
// app.put("/coupons/:couponId", isDirector, updateCoupon);
// app.delete("/coupons/:couponId", isDirector, deleteCoupon);
// app.get("/coupons", isDirector, getAllCoupons);
