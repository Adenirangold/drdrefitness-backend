import { NextFunction, Request, Response } from "express";
import Member from "../models/member";

export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    res.status(201).json({ status: "success", message: "Member created" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
