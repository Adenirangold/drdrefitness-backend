import { NextFunction, Request, Response } from "express";
import Member from "../models/member";

export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json({
      status: "success",
      data: member,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
