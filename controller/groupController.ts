import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Plan from "../models/plan";
import { sendGroupInvitationEmail } from "../config/email";

export const sendGroupInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = req.user;
    console.log(member);

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

    const result = await sendGroupInvitationEmail({
      inviterName: `${member.firstName}${" "}${member.lastName}`,
      inviteeEmail: req.body.email,
      planName: plan.name,
      planEndDate: member.currentSubscription.endDate,
      planLocation: plan.gymLocation,
      planBranch: plan.gymBranch,
      inviteLink: "/local",
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
