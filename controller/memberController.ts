import { NextFunction, Request, Response } from "express";
import Member from "../models/member";
import AppError from "../utils/AppError";
import { comparePasswords, hashPassword } from "../lib/util";
import Plan from "../models/plan";
import { paystackInitializePayment } from "../config/paystack";

export const getMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const member = req.user;

    if (!member) {
      return next(new AppError("Member does not exist", 404));
    }

    res.status(200).json({
      status: "success",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    if (req.body.role && req.body.role !== "member") {
      return next(
        new AppError("Role cannot be modified through this endpoint", 403)
      );
    }

    const member = req.user;

    if (!member) {
      return next(new AppError("Member does not exist", 404));
    }
    if (req.body.password) {
      return next(
        new AppError(
          "Password cannot be updated here. Use the password update endpoint.",
          401
        )
      );
    }
    if (req.body.currentSubscription) {
      return next(
        new AppError(
          "Updating subscription cant be done on this end-point",
          401
        )
      );
    }
    const updatedMember = await Member.findByIdAndUpdate(member._id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedMember) {
      return next(new AppError("Member does not exist", 404));
    }

    res.status(200).json({
      status: "success",
      data: updatedMember,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMemberPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const member = req.user;

    const { password, newPassword } = req.body;

    const currentPassword = await Member.findById(member._id).select(
      "password"
    );
    if (!currentPassword) {
      return next(new AppError("Member does not exist", 404));
    }

    const isPasswordValid = await comparePasswords(
      password,
      currentPassword.password!
    );

    if (!isPasswordValid) {
      return next(new AppError("Invalid current password", 401));
    }

    const newHashedPassword = await hashPassword(newPassword);

    const updatedMember = await Member.findByIdAndUpdate(
      member._id,
      {
        password: newHashedPassword,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
