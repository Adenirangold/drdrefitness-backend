import { NextFunction, Request, Response } from "express";
import Plan from "../models/plan";
import AppError from "../utils/AppError";
import { createPaystackPlan, updatePaystackPlan } from "../config/paystack";

export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { planType, name, gymLocation, gymBranch } = req.body;
  try {
    const existingPlan = await Plan.findOne({
      name,
      gymLocation,
      gymBranch,
      planType,
    });

    if (existingPlan) {
      return next(new AppError("plan already exist", 409));
    }

    let interval = "monthly";
    if (name === "3-months") {
      interval = "quarterly";
    } else if (name === "6-months") {
      interval = "biannually";
    } else if (name === "1-year") {
      interval = "annually";
    }

    const planName = `${gymLocation}-${gymBranch}-${planType}-${name}`;

    const paystackResponse = await createPaystackPlan(
      planName,
      req.body.price,
      interval
    );
    console.log(paystackResponse);

    await Plan.create({
      ...req.body,
      paystackPlanCode: paystackResponse.data.data.plan_code,
    });

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

export const getPlanByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const plan = await Plan.find({});
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

    if (plan.name === "2-months") {
      res.status(200).json({
        status: "success",
        message: "Plan updated successfully",
      });
    }

    let interval = "monthly";
    if (plan.name === "3-months") {
      interval = "quarterly";
    } else if (plan.name === "6-months") {
      interval = "biannually";
    } else if (plan.name === "1-year") {
      interval = "annually";
    }

    if (!plan.paystackPlanCode) {
      return next(new AppError("Paystack plan code not found", 400));
    }

    await updatePaystackPlan({
      paystackPlanCode: plan.paystackPlanCode || "",
      name: plan.name,
      price: plan.price,
      interval,
    });

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
