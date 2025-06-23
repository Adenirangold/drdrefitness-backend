import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import CheckInStation from "../models/checkInStation";
import Plan from "../models/plan";
import CheckInOutHistory from "../models/checkInOut";
import { io } from "../app";

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

    let stationQrCodeCreatedAtExpire;
    if (station && station.qrCodeCreatedAt) {
      stationQrCodeCreatedAtExpire =
        (new Date().getTime() - station.qrCodeCreatedAt.getTime()) / 1000 >
        3600;
    }

    if (!station || !station.qrCodeCreatedAt || stationQrCodeCreatedAtExpire) {
      return next(new AppError("Invalid or expired QR code", 400));
    }

    const subscription = member.currentSubscription;
    const plan = subscription?.plan
      ? await Plan.findById(subscription.plan._id)
      : null;

    if (
      !subscription ||
      subscription.subscriptionStatus !== "active" ||
      !plan ||
      plan.gymBranch !== station.gymBranch ||
      plan.gymLocation !== station.gymLocation
    ) {
      return next(new AppError("No active subscription for this branch", 403));
    }

    let historyDoc = await CheckInOutHistory.findOne({ memberId: member._id });

    if (!historyDoc) {
      historyDoc = new CheckInOutHistory({
        memberId: member._id,
        history: [],
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const latestCheckIn = historyDoc.history.find(
      (entry) =>
        entry.checkInTime >= startOfDay &&
        !entry.checkOutTime &&
        entry.status === "checked-in" &&
        entry.stationId?.toString() === station._id.toString()
    );

    // console.log(latestCheckIn);

    if (!latestCheckIn) {
      const newEntry = {
        checkInTime: new Date(),
        stationId: station.id,
        status: "checked-in",
      };
      historyDoc.history.push(newEntry);
      await historyDoc.save();

      io.to(station.gymBranch).emit("check-in", {
        member: {
          name: `${member.firstName} ${member.lastName}`,
          regNumber: member.regNumber,
          checkInTime: newEntry.checkInTime,
          checkOutTime: null,
          stationId: station._id,
        },
        message: `${member.firstName} ${member.lastName} checked in at ${station.gymBranch} Branch`,
      });

      res.status(200).json({
        status: "success",
        message: "Access Granted",
        action: "check-in",
      });
    } else {
      // Check-out: Update latest entry
      const checkOutTime = new Date();
      await CheckInOutHistory.updateOne(
        {
          memberId: member._id,
          "history.checkInTime": latestCheckIn.checkInTime,
        },
        {
          $set: {
            "history.$.checkOutTime": checkOutTime,
            "history.$.status": "checked-out",
          },
        }
      );

      io.to(station.gymBranch).emit("check-out", {
        member: {
          name: `${member.firstName} ${member.lastName}`,
          regNumber: member.regNumber,
          checkInTime: latestCheckIn.checkInTime,
          checkOutTime: checkOutTime,
          stationId: station._id,
        },
        message: `${member.firstName} ${member.lastName} checked out at ${station.gymBranch}`,
      });

      res.status(200).json({
        status: "success",
        message: "Check-Out Successful",
        action: "check-out",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getCheckInOutMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { gymLoaction, gymBranch } = req.params;
    const { date } = req.query;

    let dateFilter;
    if (date) {
      const selectedDate = new Date(date as string);
      if (isNaN(selectedDate.getTime())) {
        return next(new AppError("Invalid date format", 400));
      }
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      dateFilter = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Default to today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = { $gte: startOfDay, $lte: endOfDay };
    }

    const records = await CheckInOutHistory.aggregate([
      { $unwind: "$history" },
      {
        $lookup: {
          from: "checkinstations",
          localField: "history.stationId",
          foreignField: "_id",
          as: "station",
        },
      },
      { $unwind: "$station" },
      {
        $match: {
          "station.gymBranch": gymBranch,
          "station.gymLocation": gymLoaction,
          "history.checkInTime": dateFilter,
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "member",
        },
      },
      { $unwind: "$member" },
      {
        $project: {
          name: { $concat: ["$member.firstName", " ", "$member.lastName"] },
          regNumber: "$member.regNumber",
          checkInTime: "$history.checkInTime",
          checkOutTime: "$history.checkOutTime",
          daysRemaining: {
            $cond: {
              if: "$member.currentSubscription.endDate",
              then: {
                $floor: {
                  $divide: [
                    {
                      $subtract: [
                        "$member.currentSubscription.endDate",
                        new Date(),
                      ],
                    },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
              else: "N/A",
            },
          },
        },
      },
      { $sort: { checkInTime: -1 } },
      { $limit: 50 },
    ]);

    res.status(200).json({
      status: "success",
      data: records,
    });
  } catch (error) {
    next(new AppError("Server error", 500));
  }
};
