import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";
import Plan from "../models/plan";
import {
  cancelPaystackSubscription,
  createSubscription,
  paystackInitializePayment,
  paystackVerifyPayment,
} from "../config/paystack";
import { sendSubscriptionEmail, sendWelcomeEmail } from "../config/email";
import { createHashedToken, formatDate } from "../lib/util";
import Coupon from "../models/coupons";

// export const reactivateSubscription = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const currentMember = req.user;
//     if (!currentMember) {
//       return next(new AppError("Unauthorised", 401));
//     }

//     if (
//       currentMember.isGroup &&
//       currentMember.groupRole === "dependant" &&
//       currentMember.groupSubscription?.primaryMember
//     ) {
//       const primaryMemberId =
//         currentMember.groupSubscription.primaryMember.toString();

//       const updatedPrimary = await Member.findOneAndUpdate(
//         { _id: primaryMemberId },
//         {
//           $pull: {
//             "groupSubscription.dependantMembers": { member: currentMember._id },
//           },
//         },
//         { new: true }
//       );
//       if (!updatedPrimary) {
//         console.warn(
//           `Primary member ${primaryMemberId} not found or update failed`
//         );
//       }
//     }

//     const { planType, name, gymLocation, gymBranch } = req.body;

//     const existingPlan = await Plan.findOne({
//       planType,
//       name,
//       gymLocation,
//       gymBranch,
//     });
//     if (!existingPlan) {
//       return next(
//         new AppError("Plan for this subscription no longer exist", 404)
//       );
//     }

//     const isNotGroup = existingPlan.planType === "individual";

//     const currentPlanId =
//       currentMember?.currentSubscription?.plan?._id?.toString();
//     const newPlanId = existingPlan._id.toString();
//     const isSamePlan = currentPlanId === newPlanId;

//     const paymentResponse = await paystackInitializePayment(
//       req.user.email,
//       existingPlan.price,
//       {
//         phoneNumber: req.user.phoneNumber,
//         lastName: req.user.lastName,
//         firstName: req.user.firstName,
//       }
//     );

//     const { hashedtoken } = createHashedToken();

//     let update: any = {
//       $set: {
//         "currentSubscription.transactionReference":
//           paymentResponse.data.data.reference,
//         "currentSubscription.plan": existingPlan._id,
//         "currentSubscription.startDate": new Date(),
//         "currentSubscription.subscriptionStatus": "inactive",
//       },
//       $unset: {
//         "currentSubscription.paymentMethod": "",
//         "currentSubscription.paymentStatus": "",
//       },
//     };

//     if (isNotGroup) {
//       update.$set = {
//         ...update.$set,
//         isGroup: false,
//         groupRole: "none",
//       };
//       update.$unset = {
//         ...update.$unset,
//         groupSubscription: "",
//       };
//     } else if (!isSamePlan && !isNotGroup) {
//       update.$set = {
//         ...update.$set,
//         isGroup: true,
//         groupRole: "primary",
//         "groupSubscription.groupType": existingPlan.planType,
//         "groupSubscription.groupInviteToken": hashedtoken,
//         "groupSubscription.groupMaxMember":
//           existingPlan.planType === "couple"
//             ? 2
//             : existingPlan.planType === "family"
//             ? 4
//             : undefined,
//         "groupSubscription.dependantMembers": [],
//       };
//       update.$unset = {
//         ...update.$unset,
//       };
//     }

//     const updatedMember = await Member.findByIdAndUpdate(req.user._id, update, {
//       new: true,
//       runValidators: true,
//     });

//     // console.log(updatedMember);

//     if (!updatedMember) {
//       return next(new AppError("Reactivation unsucessful ", 404));
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         authorizationUrl: paymentResponse.data.data.authorization_url,
//         reference: paymentResponse.data.data.reference,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const confirmSubscriptionPayment = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { reference } = req.params;

//   const verificationResponse = await paystackVerifyPayment(reference);

//   if (
//     !verificationResponse.status ||
//     verificationResponse.status !== "success"
//   ) {
//     return next(new AppError("Payment verification failed", 400));
//   }

//   const member = await Member.findOne({
//     "currentSubscription.transactionReference": reference,
//   }).populate("currentSubscription.plan");
//   if (!member) {
//     return next(new AppError("Member not found", 404));
//   }

//   const plan = member?.currentSubscription?.plan as any;
//   if (!plan) {
//     return next(new AppError("Plan not found for subscription", 404));
//   }

//   const isIndividualPlan = plan?.planType === "individual";
//   member.isActive = true;
//   member.currentSubscription = {
//     ...member.currentSubscription,
//     paymentMethod: verificationResponse.payment_type || "card",
//     subscriptionStatus: "active",
//     paymentStatus:
//       verificationResponse.status === "success" ? "approved" : "declined",

//     startDate: new Date(),
//     autoRenew: false,
//   };

//   if (isIndividualPlan) {
//     member.isGroup = false;
//     member.groupRole = "none";
//   } else {
//     member.isGroup = true;
//   }

//   if (!isIndividualPlan && member.groupSubscription?.dependantMembers?.length) {
//     const dependantIds = member.groupSubscription.dependantMembers.map(
//       (dep: any) => dep.member
//     );
//     const dependants = await Member.find({ _id: { $in: dependantIds } });
//     for (const dep of dependants) {
//       dep.isActive = true;
//       dep.currentSubscription = {
//         plan: plan._id,
//         subscriptionStatus: "active",
//         startDate: new Date(),
//         autoRenew: false,
//         paymentMethod: verificationResponse.payment_type || "card",
//         paymentStatus: "approved",
//         transactionReference: reference,
//       };
//       await dep.save();
//     }
//   }

//   await cancelPaystackSubscription(
//     member.currentSubscription.subscriptionCode!
//   );
//   const subscriptionResponse = await createSubscription({
//     email: member.email!,
//     planCode: plan.paystackPlanCode,
//     authorizationCode: member.currentSubscription?.authorizationCode!,
//   });

//   member.currentSubscription.subscriptionCode =
//     subscriptionResponse.data.data.subscription_code;
//   await member.save();

//   await sendSubscriptionEmail(
//     "adeniranbayogold@gmail.com",
//     `${member.firstName}${" "}${member.lastName}`,
//     `${plan?.name || ""}`,
//     `${formatDate(member.currentSubscription.endDate!)}`,
//     plan?.duration!
//   );

//   res.status(200).json({
//     status: "success",
//     message: "subscription reactivation successfull",
//   });
// };

/////////////////////////////// new code //////////////////////////////////////

export const reactivateSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentMember = req.user;
    if (!currentMember) {
      return next(new AppError("Unauthorised", 401));
    }

    // Remove from group subscription if dependent
    if (
      currentMember.isGroup &&
      currentMember.groupRole === "dependant" &&
      currentMember.groupSubscription?.primaryMember
    ) {
      const updatedPrimary = await Member.findOneAndUpdate(
        { _id: currentMember.groupSubscription.primaryMember },
        {
          $pull: {
            "groupSubscription.dependantMembers": { member: currentMember._id },
          },
        },
        { new: true }
      );
      if (!updatedPrimary) {
        return next(new AppError("Failed to update primary member", 500));
      }
    }

    const { planType, name, gymLocation, gymBranch, couponCode } = req.body;
    const existingPlan = await Plan.findOne({
      planType,
      name,
      gymLocation,
      gymBranch,
    });
    if (!existingPlan) {
      return next(
        new AppError("Plan for this subscription no longer exists", 404)
      );
    }

    let amount = existingPlan.price;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        applicablePlans: existingPlan._id,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
        $or: [
          { maxUses: null },
          { $expr: { $lt: ["$currentUses", "$maxUses"] } },
        ],
      });

      if (!coupon) {
        return next(new AppError("Invalid or expired coupon code", 400));
      }

      if (coupon.discountType === "percentage") {
        amount = existingPlan.price * (1 - coupon.discountValue / 100);
      } else {
        amount = Math.max(0, existingPlan.price - coupon.discountValue);
      }

      // Increment coupon usage
      await Coupon.updateOne({ _id: coupon._id }, { $inc: { currentUses: 1 } });
    }

    const isNotGroup = existingPlan.planType === "individual";
    const currentPlanId =
      currentMember?.currentSubscription?.plan?._id?.toString();
    const isSamePlan = currentPlanId === existingPlan._id.toString();

    const paymentResponse = await paystackInitializePayment(
      req.user.email,
      amount,
      {
        phoneNumber: req.user.phoneNumber,
        lastName: req.user.lastName,
        firstName: req.user.firstName,
      }
    );

    if (paymentResponse.data.status !== true) {
      return next(new AppError("Failed to initializess payment", 500));
    }

    const { hashedtoken } = createHashedToken();
    const update = {
      $set: {
        "currentSubscription.transactionReference":
          paymentResponse.data.data.reference,
        "currentSubscription.plan": existingPlan._id,
        "currentSubscription.startDate": new Date(),
        "currentSubscription.subscriptionStatus": "inactive",
        ...(isNotGroup
          ? { isGroup: false, groupRole: "none" }
          : {
              isGroup: true,
              groupRole: "primary",
              "groupSubscription.groupType": existingPlan.planType,
              "groupSubscription.groupInviteToken": hashedtoken,
              "groupSubscription.groupMaxMember":
                existingPlan.planType === "couple" ? 2 : 4,
              "groupSubscription.dependantMembers": [],
            }),
      },
      $unset: {
        // "currentSubscription.paymentMethod": "",
        // "currentSubscription.paymentStatus": "",
        // ...(!isNotGroup ? {} : { groupSubscription: "" }),
        "currentSubscription.paymentMethod": "",
        "currentSubscription.paymentStatus": "",
        "currentSubscription.authorizationCode": "",
        "currentSubscription.cardDetails": "",
        "currentSubscription.subscriptionCode": "",
        "currentSubscription.paystackEmailToken": "",
        ...(!isNotGroup ? {} : { groupSubscription: "" }),
      },
    };

    const updatedMember = await Member.findByIdAndUpdate(
      currentMember._id,
      update,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMember) {
      return next(new AppError("Reactivation unsuccessful", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        authorizationUrl: paymentResponse.data.data.authorization_url,
        reference: paymentResponse.data.data.reference,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmSubscriptionPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reference } = req.params;
    const verificationResponse = await paystackVerifyPayment(reference);

    if (!verificationResponse.status) {
      return next(new AppError("Payment verification failed", 400));
    }

    const member = await Member.findOne({
      "currentSubscription.transactionReference": reference,
    }).populate("currentSubscription.plan");
    if (!member) {
      return next(new AppError("Member not found", 404));
    }

    const plan = member.currentSubscription?.plan as any;
    if (!plan) {
      return next(new AppError("Plan not found for subscription", 404));
    }

    const isIndividualPlan = plan.planType === "individual";
    member.isActive = true;
    const cardDetails = {
      lastDigits: verificationResponse.lastCardDigits,
      cardType: verificationResponse.cardType,
      expMonth: verificationResponse.exp_month,
      expYear: verificationResponse.exp_year,
    };
    member.currentSubscription = {
      ...member.currentSubscription,
      paymentMethod: verificationResponse.payment_type || "card",
      subscriptionStatus: "active",
      paymentStatus: "approved",
      startDate: new Date(),
      autoRenew: false,
      cardDetails,
    };

    if (isIndividualPlan) {
      member.isGroup = false;
      member.groupRole = "none";
    } else {
      member.isGroup = true;
    }

    if (
      !isIndividualPlan &&
      member.groupSubscription?.dependantMembers?.length
    ) {
      const dependantIds = member.groupSubscription.dependantMembers.map(
        (dep: any) => dep.member
      );
      const dependants = await Member.find({ _id: { $in: dependantIds } });
      for (const dep of dependants) {
        dep.isActive = true;
        dep.currentSubscription = {
          plan: plan._id,
          subscriptionStatus: "active",
          startDate: new Date(),
          autoRenew: false,
          paymentMethod: verificationResponse.payment_type || "card",
          paymentStatus: "approved",
          transactionReference: reference,
        };
        await dep.save();
      }
    }

    if (
      member.currentSubscription.subscriptionCode &&
      member.currentSubscription.paystackEmailToken
    ) {
      const cancelResponse = await cancelPaystackSubscription({
        subscriptionCode: member.currentSubscription.subscriptionCode,
        emailToken: member.currentSubscription.paystackEmailToken,
      });
      if (!cancelResponse.status) {
        return next(
          new AppError("Failed to cancel previous subscription", 500)
        );
      }
    }

    console.log(verificationResponse.authorization_code);

    if (plan?.name !== "2-months") {
      const subscriptionResponse = await createSubscription({
        email: member.email!,
        planCode: plan.paystackPlanCode,
        authorizationCode: verificationResponse.authorization_code,
      });

      if (subscriptionResponse.data.status !== true) {
        return next(new AppError("Failed to create new subscription", 500));
      }

      member.currentSubscription.subscriptionCode =
        subscriptionResponse.data.data.subscription_code;
      member.currentSubscription.paystackEmailToken =
        subscriptionResponse.data.data.email_token;
    }

    await member.save();

    await sendSubscriptionEmail(
      "adeniranbayogold@gmail.com",
      `${member.firstName} ${member.lastName}`,
      plan.name,
      formatDate(member.currentSubscription.endDate!),
      plan.duration
    );

    res.status(200).json({
      status: "success",
      message: "Subscription reactivation successful",
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentMember = req.user;

    if (!currentMember) {
      return next(new AppError("Unauthorised", 401));
    }

    if (
      !currentMember.currentSubscription ||
      currentMember.currentSubscription.subscriptionStatus !== "active"
    ) {
      return next(new AppError("No active subscription to cancel", 400));
    }

    const updatedMember = await Member.findByIdAndUpdate(
      currentMember._id,
      {
        $set: {
          isActive: false,
          "currentSubscription.subscriptionStatus": "cancelled",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMember) {
      return next(new AppError("Member not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};
