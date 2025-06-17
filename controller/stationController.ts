import { NextFunction, Request, Response } from "express";
import QRCode from "qrcode";
import CheckInStation from "../models/checkInStation";
import AppError from "../utils/AppError";
import jwt, { SignOptions } from "jsonwebtoken";

export const createStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { gymLocation, gymBranch } = req.body;

    const existingStation = await CheckInStation.findOne({
      gymBranch,
      gymLocation,
    });
    if (existingStation) {
      return next(
        new AppError(
          "This station exist already.Try with new branch and location",
          500
        )
      );
    }

    const station = new CheckInStation({
      gymLocation,
      gymBranch,
      qrCodeToken: null,
      qrCodeCreatedAt: null,
    });

    await station.save();

    res.status(201).json({
      status: "success",
      message: "Added check-in station successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { adminLocation } = req.user;

    if (!adminLocation) {
      return next(new AppError("Unauthorised", 500));
    }

    const station = await CheckInStation.findOne({
      gymLocation: adminLocation.location,
      gymBranch: adminLocation.branch,
    });
    if (!station) {
      return next(
        new AppError("Station not found for this location and branch", 500)
      );
    }
    const now = new Date();
    const isExpired =
      !station.qrCodeCreatedAt ||
      (now.getTime() - station.qrCodeCreatedAt.getTime()) / 1000 > 30;

    let token = station.qrCodeToken;
    if (isExpired) {
      token = jwt.sign(
        { stationId: station._id, timestamp: now },
        process.env.JWT_SECRET!,
        { expiresIn: "3600000s" }
      );
      await CheckInStation.updateOne(
        { _id: station._id },
        { qrCodeToken: token, qrCodeCreatedAt: now }
      );
    }

    // Generate QR code data URL

    const qrCodeData = await QRCode.toDataURL(
      JSON.stringify({ token, stationId: station._id })
    );

    res.status(200).json({
      status: "success",
      data: {
        checkInStationId: station._id,
        token,
        // qrCode: qrCodeData,
        expiresAt: new Date(
          (station.qrCodeCreatedAt || now).getTime() + 60 * 60 * 1000
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};
export const getAllStations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const director = req.user;

    if (!director) {
      return next(new AppError("Unauthorised", 500));
    }

    const stations = await CheckInStation.find();
    if (!stations) {
      return next(new AppError("No Check-in stationsfound", 500));
    }

    res.status(200).json({
      status: "success",
      data: stations || [],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deletedStation = await CheckInStation.findByIdAndDelete(id);

    if (!deletedStation) {
      return next(new AppError("No station found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Station deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
