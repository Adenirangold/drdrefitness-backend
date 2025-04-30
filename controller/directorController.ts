import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";

export const getMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const allMembers = await Member.aggregate([
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
          role: "member",
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

    if (!allMembers) {
      return next(new AppError("Member does not exist", 404));
    }

    res.status(200).json({
      status: "success",
      data: allMembers || [],
    });
  } catch (error) {
    next(error);
  }
};
