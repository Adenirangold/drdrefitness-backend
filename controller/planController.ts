import { NextFunction, Request, Response } from "express";
import Plan from "../models/plan";
import AppError from "../utils/AppError";

export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const existingPlan = await Plan.findOne({ planId: req.body.planId });

    if (existingPlan) {
      return next(new AppError("plan already exist", 409));
    }

    await Plan.create(req.body);

    res.status(201).json({ status: "success", message: "plan created" });
  } catch (error) {
    next(error);
  }
};
export const getAllPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const plans = await Plan.find();
    if (!plans) {
      return next(new AppError("No plan exist", 400));
    }
    res.status(200).json({
      status: "success",
      data: plans,
    });
  } catch (err) {
    next(err);
  }
};
export const getPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findById(planId);

    if (!plan) {
      return next(new AppError("Plan not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findByIdAndUpdate(planId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return next(new AppError("Plan not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Plan updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deletePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId } = req.params;

    // Find and delete the plan
    const plan = await Plan.findByIdAndDelete(planId);

    if (!plan) {
      return next(new AppError("Plan not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Plan deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
