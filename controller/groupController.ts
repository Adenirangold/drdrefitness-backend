import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};
