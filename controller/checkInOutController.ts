import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import CheckInStation from "../models/checkInStation";

export const scanMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const member = req.user;
    const { token, stationId } = req.body;
    const station = await CheckInStation.findOne({
      _id: stationId,
      qrCodeToken: token,
    });
    if (
      !station ||
      !station.qrCodeCreatedAt ||
      isNaN(new Date(station.qrCodeCreatedAt).getTime()) ||
      (Date.now() - new Date(station.qrCodeCreatedAt).getTime()) / 1000 > 30
    ) {
      return next(new AppError("Invalid or expired QR code", 400));
    }
  } catch (error) {
    next(error);
  }
};
