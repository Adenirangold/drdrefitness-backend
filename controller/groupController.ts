import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Plan from "../models/plan";
import { sendGroupInvitationEmail } from "../config/email";
import { log } from "console";
import Member from "../models/member";
import { getJWTToken, verifyToken } from "../lib/util";
import mongoose from "mongoose";

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

    const dependantMember = await Member.findOne({
      email: req.body.email,
    });

    const isAlreadyMember = !!dependantMember;
    if (dependantMember) {
      if (
        dependantMember.isGroup &&
        dependantMember.groupRole === "primary" &&
        (dependantMember.groupSubscription?.dependantMembers?.length ?? 0) > 0
      ) {
        return next(
          new AppError("Cannot invite a primary member with dependants", 400)
        );
      }
      if (
        dependantMember.isGroup &&
        dependantMember.groupRole === "dependant" &&
        dependantMember.groupSubscription?.primaryMember?.toString() !==
          member._id.toString()
      ) {
        return next(
          new AppError("Member is already a dependant in another group", 400)
        );
      }
    }

    const token = getJWTToken({ email: req.body.email });

    const result = await sendGroupInvitationEmail({
      inviterName: `${member.firstName}${" "}${member.lastName}`,
      // inviteeEmail: req.body.email,
      inviteeEmail: "adeniranbayogold@gmail.com",
      planName: plan.name,
      planEndDate: member.currentSubscription.endDate,
      planLocation: plan.gymLocation,
      planBranch: plan.gymBranch,
      inviteLink: `${
        isAlreadyMember
          ? `${process.env.FRONT_END_URL}/member/accept-member/${member.groupSubscription.groupInviteToken}/${token}`
          : `${process.env.FRONT_END_URL}/member/accept-new-member/${member.groupSubscription.groupInviteToken}/${token}`
      }`,
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
      return next(new AppError("Unauthorized to join group", 401));
    }

    const primaryMember = await Member.findOne({
      "groupSubscription.groupInviteToken": req.params.token,
    }).populate("currentSubscription.plan");
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

    let dependantMember = await Member.findOne({ email: req.body.email });

    const subscription = {
      plan: primaryMember.currentSubscription?.plan,
      subscriptionStatus:
        primaryMember.currentSubscription?.subscriptionStatus || "active",
      startDate: primaryMember.currentSubscription?.startDate || new Date(),
      endDate: primaryMember.currentSubscription?.endDate,
      autoRenew: primaryMember.currentSubscription?.autoRenew || false,
      paymentMethod: primaryMember.currentSubscription?.paymentMethod,
      paymentStatus:
        primaryMember.currentSubscription?.paymentStatus || "approved",
      transactionReference:
        primaryMember.currentSubscription?.transactionReference,
    };

    if (dependantMember) {
      if (
        dependantMember.isGroup &&
        dependantMember.groupRole === "primary" &&
        (dependantMember.groupSubscription?.dependantMembers?.length ?? 0) > 0
      ) {
        return next(
          new AppError(
            "Primary members with dependants cannot join another group as a dependant",
            400
          )
        );
      }
      if (
        dependantMember.isGroup &&
        dependantMember.groupRole === "dependant" &&
        dependantMember.groupSubscription?.primaryMember?.toString() !==
          primaryMember._id.toString()
      ) {
        return next(
          new AppError("Member is already a dependant in another group", 400)
        );
      }
      if (
        dependantMember.isGroup &&
        dependantMember.groupRole === "dependant" &&
        dependantMember.groupSubscription?.primaryMember?.toString() ===
          primaryMember._id.toString()
      ) {
        return next(
          new AppError(
            "Member is already a dependant of this primary member",
            400
          )
        );
      }

      // Reset if they were a primary member with no dependants
      if (dependantMember.isGroup && dependantMember.groupRole === "primary") {
        dependantMember.isGroup = false;
        dependantMember.groupRole = "none";
        dependantMember.groupSubscription = undefined;
      }

      dependantMember.isActive = true;
      dependantMember.currentSubscription = subscription;
      dependantMember.isGroup = true;
      dependantMember.groupRole = "dependant";
      dependantMember.groupSubscription = {
        groupType: primaryMember.groupSubscription.groupType,
        primaryMember: primaryMember._id,
        groupMaxMember:
          primaryMember.groupSubscription.groupType === "couple" ? 2 : 4,
        dependantMembers: new mongoose.Types.DocumentArray([]),
        groupInviteToken: undefined,
      };

      await dependantMember.save();
    } else {
      dependantMember = new Member({
        ...req.body,
        isActive: true,
        currentSubscription: subscription,
        isGroup: true,
        groupRole: "dependant",
        groupSubscription: {
          groupType: primaryMember.groupSubscription?.groupType,
          primaryMember: primaryMember._id,
        },
      });

      await dependantMember.save();
    }

    const updatedPrimaryMember = await Member.findOneAndUpdate(
      { _id: primaryMember._id },
      {
        $push: {
          "groupSubscription.dependantMembers": {
            member: dependantMember._id,
            status: "active",
            joinedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedPrimaryMember) {
      return next(
        new AppError("Failed to update primary member with dependant", 500)
      );
    }

    res.status(200).json({
      status: "success",
      message: "Dependant member added successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const removeDependant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const primaryMember = req.user;
    if (!primaryMember) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!primaryMember.isGroup || primaryMember.groupRole !== "primary") {
      return next(
        new AppError("Only primary members can remove dependants", 403)
      );
    }

    const dependantId = req.body.id;

    const dependantExists =
      primaryMember.groupSubscription?.dependantMembers.some(
        (dep: any) => dep.member.toString() === dependantId
      );
    if (!dependantExists) {
      return next(new AppError("Dependant not found in your group", 404));
    }

    const updatedPrimaryMember = await Member.findOneAndUpdate(
      { _id: primaryMember._id },
      {
        $pull: {
          "groupSubscription.dependantMembers": { member: dependantId },
        },
      },
      { new: true }
    );

    if (!updatedPrimaryMember) {
      return next(new AppError("Failed to update primary member", 500));
    }

    const updatedDependant = await Member.findByIdAndUpdate(
      dependantId,
      {
        $set: {
          isGroup: false,
          groupRole: "none",
          "currentSubscription.subscriptionStatus": "inactive",
          isActive: false,
        },
        $unset: {
          groupSubscription: "",
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedDependant) {
      return next(new AppError("Failed to update dependant member", 500));
    }

    res.status(200).json({
      status: "success",
      message: "Dependant removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
