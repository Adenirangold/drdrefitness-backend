import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

import Member from "../models/member";
import { createHashedToken } from "../lib/util";
import Plan from "../models/plan";

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
      "adminLocation.branch": req.body.adminLocation.branch,
      "adminLocation.location": req.body.adminLocation.location,
    }).select("email");
    if (existingAdmin) {
      return next(
        new AppError(
          "Admin for this location and branch already exist. Please use a different credentials(email,branch,location)",
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
          as: "currentPlanDetails",
        },
      },

      {
        $lookup: {
          from: "plans",
          localField: "membershipHistory.plan",
          foreignField: "_id",
          as: "historyPlanDetails",
        },
      },

      {
        $lookup: {
          from: "members",
          localField: "groupSubscription.primaryMember",
          foreignField: "_id",
          as: "primaryMemberDetails",
        },
      },

      {
        $lookup: {
          from: "members",
          localField: "groupSubscription.dependantMembers.member",
          foreignField: "_id",
          as: "dependantMemberDetails",
        },
      },

      {
        $match: {
          "currentPlanDetails.gymLocation": gymLocation,
          "currentPlanDetails.gymBranch": gymBranch,
        },
      },

      {
        $project: {
          _id: 1,
          regNumber: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phoneNumber: 1,
          dateOfBirth: 1,
          gender: 1,
          profilePicture: 1,
          address: 1,
          emergencyContact: 1,
          healthInfo: 1,
          adminLocation: 1,
          isActive: 1,
          registrationDate: 1,
          currentSubscription: {
            plan: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$currentPlanDetails",
                    as: "plan",
                    in: {
                      name: "$$plan.name",
                      planType: "$$plan.planType",
                      duration: "$$plan.duration",
                      price: "$$plan.price",
                    },
                  },
                },
                0,
              ],
            },
            subscriptionStatus: "$currentSubscription.subscriptionStatus",
            startDate: "$currentSubscription.startDate",
            endDate: "$currentSubscription.endDate",
            autoRenew: "$currentSubscription.autoRenew",
            paymentMethod: "$currentSubscription.paymentMethod",
            paymentStatus: "$currentSubscription.paymentStatus",
            transactionReference: "$currentSubscription.transactionReference",
          },
          membershipHistory: {
            $map: {
              input: "$membershipHistory",
              as: "history",
              in: {
                plan: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$historyPlanDetails",
                        as: "plan",
                        cond: { $eq: ["$$plan._id", "$$history.plan"] },
                      },
                    },
                    0,
                  ],
                },
                startDate: "$$history.startDate",
                endDate: "$$history.endDate",
              },
            },
          },
          isGroup: 1,
          groupRole: 1,
          groupSubscription: {
            groupType: "$groupSubscription.groupType",
            groupMaxMember: "$groupSubscription.groupMaxMember",
            primaryMember: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$primaryMemberDetails",
                    as: "member",
                    in: {
                      firstName: "$$member.firstName",
                      lastName: "$$member.lastName",
                      email: "$$member.email",
                      phoneNumber: "$$member.phoneNumber",
                    },
                  },
                },
                0,
              ],
            },
            dependantMembers: {
              $map: {
                input: "$groupSubscription.dependantMembers",
                as: "dep",
                in: {
                  member: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$dependantMemberDetails",
                          as: "member",
                          cond: { $eq: ["$$member._id", "$$dep.member"] },
                        },
                      },
                      0,
                    ],
                  },
                  status: "$$dep.status",
                  joinedAt: "$$dep.joinedAt",
                },
              },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      // Clean up nested fields
      {
        $addFields: {
          membershipHistory: {
            $map: {
              input: "$membershipHistory",
              as: "history",
              in: {
                plan: {
                  name: "$$history.plan.name",
                  planType: "$$history.plan.planType",
                  duration: "$$history.plan.duration",
                  price: "$$history.plan.price",
                },
                startDate: "$$history.startDate",
                endDate: "$$history.endDate",
              },
            },
          },
          "groupSubscription.dependantMembers": {
            $map: {
              input: "$groupSubscription.dependantMembers",
              as: "dep",
              in: {
                member: {
                  firstName: "$$dep.member.firstName",
                  lastName: "$$dep.member.lastName",
                  email: "$$dep.member.email",
                  phoneNumber: "$$dep.member.phoneNumber",
                },
                status: "$$dep.status",
                joinedAt: "$$dep.joinedAt",
              },
            },
          },
        },
      },
      // Exclude sensitive fields
      {
        $unset: [
          "password",
          "passwordResetToken",
          "passwordExpiredAt",
          "role",
          "__v",
          "groupSubscription.groupInviteToken",
        ],
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
