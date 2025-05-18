import { NextFunction, Request, Response } from "express";
import QRCode from "qrcode";
import CheckInStation from "../models/checkInStation";
import AppError from "../utils/AppError";

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

    const qrCodeUrl = await QRCode.toDataURL(station._id.toString());

    res.status(200).json({
      status: "success",
      data: {
        checkInStationId: station._id,
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
