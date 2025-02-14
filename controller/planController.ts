import { NextFunction, Request, Response } from "express";
import Plan from "../models/plan";
import AppError from "../utils/AppError";

export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    const existingPlan = await Plan.find({ planId: req.body.planId });
    if (!existingPlan) {
      return next(new AppError("plan already exist", 409));
    }

    await Plan.create(req.body);

    res.status(201).json({ status: "success", message: "plan created" });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};
