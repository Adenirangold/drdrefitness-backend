import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Plan from "../models/plan";
import { sendGroupInvitationEmail } from "../config/email";
import { log } from "console";
import Member from "../models/member";
import { getJWTToken, verifyToken } from "../lib/util";

export const sendGroupInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = req.user;

    if (member.isActive === false) {
      return next(
        new AppError(
          "Only members with active subscription can invite member",
          400
        )
      );
    }
    if (member.isGroup === false) {
      return next(
        new AppError(
          "Only members with couple and family plan subscription can invite another member",
          400
        )
      );
    }
    if (member.groupRole !== "primary") {
      return next(
        new AppError("Only primary members  can invite another member", 400)
      );
    }
    if (
      member.groupSubscription.dependantMembers.length >=
      member.groupSubscription.groupMaxMember
    ) {
      return next(
        new AppError("The group is full. Cannot invite more members.", 400)
      );
    }

    const plan = await Plan.findById(member.currentSubscription.plan);

    if (!plan) {
      return next(new AppError("Invalid subscription plan", 400));
    }

    const token = getJWTToken({ email: req.body.email });

    const result = await sendGroupInvitationEmail({
      inviterName: `${member.firstName}${" "}${member.lastName}`,
      inviteeEmail: req.body.email,
      planName: plan.name,
      planEndDate: member.currentSubscription.endDate,
      planLocation: plan.gymLocation,
      planBranch: plan.gymBranch,
      inviteLink: `${process.env.FRONT_END_URL}/member/accept-member/${member.groupSubscription.groupInviteToken}/${token}`,
    });

    if (!result) {
      return next(
        new AppError("Error sending invitation to group  email", 500)
      );
    }
    res.status(200).json({
      status: "success",
      message: `Reset token sent `,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptGroupInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const decodedToken = verifyToken(req.params.id!);

    if (decodedToken?.email !== req.body.email) {
      return next(new AppError("Unanthorised to join group", 401));
    }
    const primaryMember = await Member.findOne({
      "groupSubscription.groupInviteToken": req.params.token,
    });
    if (!primaryMember) {
      return next(new AppError("No primary member found", 401));
    }
    if (
      !primaryMember.groupSubscription ||
      primaryMember.groupSubscription.dependantMembers.length >=
        primaryMember.groupSubscription.groupMaxMember
    ) {
      return next(
        new AppError("The group is full. Cannot add more members.", 400)
      );
    }

    const dependentMember = new Member({
      ...req.body,

      isActive: true,
      currentSubscription: {
        ...primaryMember.currentSubscription,
      },
      isGroup: true,
      groupRole: "dependant",
      groupSubscription: {
        groupType: primaryMember.groupSubscription?.groupType,
        primaryMember: primaryMember._id,
      },
    });

    const savedMember = await dependentMember.save();

    const updatedPrimaryMember = await Member.findOneAndUpdate(
      { _id: primaryMember._id },
      {
        $push: {
          "groupSubscription.dependantMembers": {
            member: savedMember._id,
            status: "active",
            joinedAt: new Date(),
          },
        },
      }
    );
    if (!updatedPrimaryMember) {
      return next(
        new AppError("Failed to update primary member with dependant", 500)
      );
    }
    res.status(200).json({
      status: "success",
      message: `Dependent member added successfully`,
    });
  } catch (error) {
    next(error);
  }
};
