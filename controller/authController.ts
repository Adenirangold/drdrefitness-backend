import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const prevUser = await Member.findOne({ email: req.body.email });
    if (prevUser) {
      return next(
        new AppError(
          "This user already exists, please use a different email",
          401
        )
      );
    }
    const newMember = new Member(req.body);
    const savedMember = await newMember.save();

    console.log(savedMember);

    res.status(201).json({
      status: "Success",
      message: "Member created sucessfully",
      member: savedMember,
    });
  } catch (error) {
    console.log(error);

    next(new AppError("Error occured in creating new member", 500));
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
