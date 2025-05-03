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

export const getAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admin = await Member.find({ role: "admin" }).select("-password");
    if (!admin) {
      return next(new AppError("No admin found", 401));
    }

    res.status(200).json({
      status: "success",
      data: admin || [],
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedAdmin = await Member.findByIdAndUpdate(req.params.id, {
      ...req.body,
    });

    if (!updatedAdmin) {
      return next(new AppError("No admin found", 401));
    }

    res.status(200).json({
      status: "success",
      message: "updated admin sucessfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const plan = await Member.findByIdAndDelete(req.params.id);

    if (!plan) {
      return next(new AppError("Admin not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Admin deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export async function getAnalyticsData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const results = await Member.aggregate([
      // Match only members for relevant data
      { $match: { role: "member" } },
      // Lookup plan details
      {
        $lookup: {
          from: "plans",
          localField: "currentSubscription.plan",
          foreignField: "_id",
          as: "planDetails",
        },
      },
      { $unwind: { path: "$planDetails", preserveNullAndEmptyArrays: true } },
      // Use $facet to compute all metrics in one query
      {
        $facet: {
          // 1. Active Members (Total and Per Branch)
          activeMembers: [
            { $match: { isActive: true } },
            {
              $group: {
                _id: "$planDetails.gymBranch",
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$count" },
                byBranch: { $push: { branch: "$_id", count: "$count" } },
              },
            },
            {
              $project: {
                _id: 0,
                totalActiveMembers: "$total",
                activeMembersByBranch: {
                  $map: {
                    input: "$byBranch",
                    as: "item",
                    in: {
                      branch: { $ifNull: ["$$item.branch", "Unknown"] },
                      count: "$$item.count",
                    },
                  },
                },
              },
            },
          ],
          // 2. Non-Active Members (Total and Per Branch)
          nonActiveMembers: [
            { $match: { isActive: false } },
            {
              $group: {
                _id: "$planDetails.gymBranch",
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$count" },
                byBranch: { $push: { branch: "$_id", count: "$count" } },
              },
            },
            {
              $project: {
                _id: 0,
                totalNonActiveMembers: "$total",
                nonActiveMembersByBranch: {
                  $map: {
                    input: "$byBranch",
                    as: "item",
                    in: {
                      branch: { $ifNull: ["$$item.branch", "Unknown"] },
                      count: "$$item.count",
                    },
                  },
                },
              },
            },
          ],
          // 3. Payments for All Branches by Month
          paymentsAllBranchesByMonth: [
            {
              $match: {
                "currentSubscription.paymentStatus": "approved",
                "currentSubscription.startDate": { $ne: null },
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$currentSubscription.startDate" },
                  month: { $month: "$currentSubscription.startDate" },
                },
                totalPayment: { $sum: "$planDetails.price" },
              },
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1 },
            },
            {
              $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                totalPayment: 1,
              },
            },
          ],
          // 4. Payments for Each Branch by Month
          paymentsByBranchByMonth: [
            {
              $match: {
                "currentSubscription.paymentStatus": "approved",
                "currentSubscription.startDate": { $ne: null },
              },
            },
            {
              $group: {
                _id: {
                  branch: "$planDetails.gymBranch",
                  year: { $year: "$currentSubscription.startDate" },
                  month: { $month: "$currentSubscription.startDate" },
                },
                totalPayment: { $sum: "$planDetails.price" },
              },
            },
            {
              $sort: { "_id.branch": 1, "_id.year": 1, "_id.month": 1 },
            },
            {
              $group: {
                _id: "$_id.branch",
                payments: {
                  $push: {
                    year: "$_id.year",
                    month: "$_id.month",
                    totalPayment: "$totalPayment",
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                branch: { $ifNull: ["$_id", "Unknown"] },
                payments: 1,
              },
            },
          ],
          // 5. Cumulative Money Made Per Year
          cumulativeMoneyPerYear: [
            {
              $match: {
                "currentSubscription.paymentStatus": "approved",
                "currentSubscription.startDate": { $ne: null },
              },
            },
            {
              $group: {
                _id: { year: { $year: "$currentSubscription.startDate" } },
                totalPayment: { $sum: "$planDetails.price" },
              },
            },
            {
              $sort: { "_id.year": 1 },
            },
            {
              $project: {
                _id: 0,
                year: "$_id.year",
                totalPayment: 1,
              },
            },
          ],
          // 6. Cumulative Money Made in Total
          cumulativeMoneyTotal: [
            {
              $match: {
                "currentSubscription.paymentStatus": "approved",
              },
            },
            {
              $group: {
                _id: null,
                totalPayment: { $sum: "$planDetails.price" },
              },
            },
            {
              $project: {
                _id: 0,
                totalCumulativePayment: "$totalPayment",
              },
            },
          ],
          // 7. Number of Branches and Locations
          branchesAndLocations: [
            {
              $group: {
                _id: null,
                branches: { $addToSet: "$planDetails.gymBranch" },
                locations: { $addToSet: "$planDetails.gymLocation" },
              },
            },
            {
              $project: {
                _id: 0,
                numberOfBranches: {
                  $size: {
                    $filter: {
                      input: "$branches",
                      as: "branch",
                      cond: { $ne: ["$$branch", null] },
                    },
                  },
                },
                numberOfLocations: {
                  $size: {
                    $filter: {
                      input: "$locations",
                      as: "location",
                      cond: { $ne: ["$$location", null] },
                    },
                  },
                },
              },
            },
          ],
        },
      },
      // Unwind facet results for cleaner output
      {
        $project: {
          activeMembers: { $arrayElemAt: ["$activeMembers", 0] },
          nonActiveMembers: { $arrayElemAt: ["$nonActiveMembers", 0] },
          paymentsAllBranchesByMonth: 1,
          paymentsByBranchByMonth: 1,
          cumulativeMoneyPerYear: 1,
          cumulativeMoneyTotal: { $arrayElemAt: ["$cumulativeMoneyTotal", 0] },
          branchesAndLocations: { $arrayElemAt: ["$branchesAndLocations", 0] },
        },
      },
      // Final projection to shape the output
      {
        $project: {
          activeMembers: {
            totalActiveMembers: {
              $ifNull: ["$activeMembers.totalActiveMembers", 0],
            },
            activeMembersByBranch: {
              $ifNull: ["$activeMembers.activeMembersByBranch", []],
            },
          },
          nonActiveMembers: {
            totalNonActiveMembers: {
              $ifNull: ["$nonActiveMembers.totalNonActiveMembers", 0],
            },
            nonActiveMembersByBranch: {
              $ifNull: ["$nonActiveMembers.nonActiveMembersByBranch", []],
            },
          },
          paymentsAllBranchesByMonth: 1,
          paymentsByBranchByMonth: 1,
          cumulativeMoneyPerYear: 1,
          cumulativeMoneyTotal: {
            $ifNull: ["$cumulativeMoneyTotal.totalCumulativePayment", 0],
          },
          branchesAndLocations: {
            numberOfBranches: {
              $ifNull: ["$branchesAndLocations.numberOfBranches", 0],
            },
            numberOfLocations: {
              $ifNull: ["$branchesAndLocations.numberOfLocations", 0],
            },
          },
        },
      },
    ]);

    if (!results) {
      return next(new AppError("Unable to aggregate data", 404));
    }
    res.status(200).json({
      status: "success",
      data: results[0] || {
        activeMembers: { totalActiveMembers: 0, activeMembersByBranch: [] },
        nonActiveMembers: {
          totalNonActiveMembers: 0,
          nonActiveMembersByBranch: [],
        },
        paymentsAllBranchesByMonth: [],
        paymentsByBranchByMonth: [],
        cumulativeMoneyPerYear: [],
        cumulativeMoneyTotal: 0,
        branchesAndLocations: { numberOfBranches: 0, numberOfLocations: 0 },
      },
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    next(error);
  }
}
