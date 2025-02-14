import { NextFunction, Request, Response } from "express";

export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    res.status(201).json({ status: "success", message: "plan created" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
