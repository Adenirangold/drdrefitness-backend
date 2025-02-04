import e, { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";
import { comparePasswords, sendAuthResponse } from "../lib/util";

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
    savedMember.password = "";

    if (!savedMember) {
      return next(new AppError("Error creating new member", 500));
    }

    sendAuthResponse(res, savedMember._id, savedMember.email);
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
    const existingMember = await Member.findOne({ email });
    if (!existingMember) {
      return next(new AppError("This user does not exist", 401));
    }

    const isMatch = await comparePasswords(password, existingMember.password);
    existingMember.password = "";

    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    sendAuthResponse(res, existingMember._id, existingMember.email);
  } catch (error) {
    console.log(error);

    next(new AppError("Error occured logging in member", 500));
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
