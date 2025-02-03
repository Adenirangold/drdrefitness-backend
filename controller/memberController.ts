import { NextFunction, Request, Response } from "express";
import Member from "../models/member";
import AppError from "../utils/AppError";

export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // console.log(req.body);
    const newMember = new Member(req.body);
    const savedMember = await newMember.save();

    console.log(savedMember);

    res
      .status(201)
      .json({ status: "success", message: "Member created sucessfully" });
  } catch (error) {
    console.log(error);
    next(error);

    // next(new AppError("Error occured in creating new member", 500));
  }
};
