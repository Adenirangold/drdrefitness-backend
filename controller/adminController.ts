import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

import Member from "../models/member";

export const createAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.role && req.body.role === "director") {
      return next(new AppError("Unauthorised to create a director", 403));
    }
    const admin = req.user;

    if (!admin) {
      return next(new AppError("Unauthorised", 409));
    }

    const existingAdmin = await Member.findOne({
      email: req.body.email,
    }).select("email");
    if (existingAdmin) {
      return next(
        new AppError(
          "Email already registered. Please use a different email address",
          409
        )
      );
    }

    const adminSanitize = {
      email: req.body.email,
      regNumber: req.body.regNumber,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role: req.body.role,
      phoneNumber: req.body.phoneNumber,
      adminLocation: req.body.adminLocation,
    };

    const newAdmin = new Member(adminSanitize);

    const savedMember = await newAdmin.save();

    if (!savedMember) {
      return next(new AppError("Failed to create admin", 500));
    }

    res.status(200).json({
      status: "success",
      message: "Admin created successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminBranchMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admin = req.user;

    if (!admin) {
      return next(new AppError("Unauthorised", 409));
    }
    const gymLocation = req.user.adminLocation.location;
    const gymBranch = req.user.adminLocation.branch;

    const members = await Member.aggregate([
      {
        $lookup: {
          from: "plans",
          localField: "currentSubscription.plan",
          foreignField: "_id",
          as: "planDetails",
        },
      },
      {
        $match: {
          "planDetails.gymLocation": gymLocation,
          "planDetails.gymBranch": gymBranch,
        },
      },
      {
        $project: {
          planDetails: 0,
        },
      },
    ]);

    if (!members) {
      return next(new AppError("Unable to fetch member", 500));
    }

    res.status(200).json({
      status: "success",
      data: members || [],
    });
  } catch (err) {
    next(err);
  }
};
