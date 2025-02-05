import { NextFunction, Request, Response } from "express";
import Member from "../models/member";
import AppError from "../utils/AppError";

export const getMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Bad request", 400));
    }
    const member = await Member.findById(req.params.id).select("-password");

    if (!member) {
      return next(new AppError("Member does not exist", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        member,
      },
    });
  } catch (error) {
    next(new AppError("Error fetching member", 500));
  }
};
