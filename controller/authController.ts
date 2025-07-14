import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";
import crypto from "crypto";
import {
  calculateEndDate,
  comparePasswords,
  createHashedToken,
  getJWTToken,
  hashPassword,
  sendAuthResponse,
} from "../lib/util";
import { sendResetPasswordEmail, sendWelcomeEmail } from "../config/email";
import Plan from "../models/plan";
import {
  createSubscription,
  paystackInitializePayment,
  paystackVerifyPayment,
} from "../config/paystack";
import Coupon from "../models/coupons";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.role && req.body.role !== "member") {
      return next(new AppError("Unauthorised to create an admin account", 403));
    }

    const prevUser = await Member.findOne({ email: req.body.email }).select(
      "email"
    );
    if (prevUser) {
      return next(
        new AppError(
          "Email already registered. Please use a different email address",
          409
        )
      );
    }

    const { planType, name, gymLocation, gymBranch, couponCode } =
      req.body.currentSubscription;

    const plan = await Plan.findOne({
      planType,
      name,
      gymLocation,
      gymBranch,
    });

    if (!plan) {
      return next(new AppError("Invalid subscription plan", 400));
    }

    let amount = plan.price;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        applicablePlans: plan._id,
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
        amount = plan.price * (1 - coupon.discountValue / 100);
      } else {
        amount = Math.max(0, plan.price - coupon.discountValue);
      }

      // Increment coupon usage
      await Coupon.updateOne({ _id: coupon._id }, { $inc: { currentUses: 1 } });
    }

    const paymentResponse = await paystackInitializePayment(
      req.body.email,
      amount,
      {
        phoneNumber: req.body.phoneNumber,
        lastName: req.body.lastName,
        firstName: req.body.firstName,
      }
    );

    const isGroupPlan =
      plan.planType === "couple" || plan.planType === "family";

    const { hashedtoken } = createHashedToken();

    const newMember = new Member({
      ...req.body,
      currentSubscription: {
        plan: plan._id,
        startDate: new Date(),
        transactionReference: paymentResponse.data.data.reference,
      },
      isGroup: isGroupPlan,
      groupRole: isGroupPlan ? "primary" : undefined,
      groupSubscription: {
        groupType: isGroupPlan ? plan.planType : undefined,
        groupInviteToken: isGroupPlan ? hashedtoken : undefined,
      },
    });

    const savedMember = await newMember.save();
    savedMember.password = "";

    if (!savedMember) {
      return next(new AppError("Failed to create member", 500));
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

export const verifyPaymentAndActivate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reference } = req.params;

    const verificationResponse = await paystackVerifyPayment(reference);

    if (
      !verificationResponse.status ||
      verificationResponse.status !== "success"
    ) {
      return next(new AppError("Payment verification failed", 400));
    }

    const member = await Member.findOne({
      "currentSubscription.transactionReference": reference,
    }).populate("currentSubscription.plan");

    if (!member) {
      return next(new AppError("Member not found", 404));
    }

    // Update member fields
    member.isActive = true;
    if (member.currentSubscription) {
      member.currentSubscription.paymentMethod =
        verificationResponse.payment_type || "card";
      member.currentSubscription.subscriptionStatus = "active";
      member.currentSubscription.startDate = new Date();
      member.currentSubscription.paymentStatus =
        verificationResponse.status === "success" ? "approved" : "declined";
      member.currentSubscription.authorizationCode =
        verificationResponse.authorization_code;
      member.currentSubscription.cardDetails = {
        lastDigits: verificationResponse.lastCardDigits,
        expMonth: verificationResponse.exp_month,
        expYear: verificationResponse.exp_year,
        cardType: verificationResponse.cardType,
      };
    }

    const plan = member.currentSubscription?.plan as any;

    if (plan?.name !== "2-months") {
      const subscriptionResponse = await createSubscription({
        email: member.email!,
        planCode: plan.paystackPlanCode,
        authorizationCode: verificationResponse.authorization_code,
      });

      console.log("subscriptionResponse", subscriptionResponse);
      console.log("heyy");

      if (subscriptionResponse.data.status !== true) {
        throw new AppError(`Failed to create subscription`, 500);
      }
      if (member.currentSubscription) {
        member.currentSubscription.subscriptionCode =
          subscriptionResponse.data.data.subscription_code;
        member.currentSubscription.paystackEmailToken =
          subscriptionResponse.data.data.email_token;
      }
    }

    // Save to trigger middleware
    await member.save();

    try {
      await sendWelcomeEmail(
        "adeniranbayogold@gmail.com",
        `${member.firstName}${" "}${member.lastName}`
      );
    } catch (err) {
      console.log("error sending mail");
    }

    sendAuthResponse(res, member._id, member.email!, member.role);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }
    const existingMember = await Member.findOne({ email });
    if (!existingMember) {
      return next(
        new AppError("The member with this credential does not exist", 401)
      );
    }

    const isMatch = await comparePasswords(password, existingMember.password!);
    existingMember.password = "";

    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    sendAuthResponse(
      res,
      existingMember._id,
      existingMember.email!,
      existingMember.role
    );
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError("Please provide email", 400));
    }
    const existingMember = await Member.findOne({ email });
    if (!existingMember) {
      return next(new AppError("This user does not exist", 401));
    }
    const { resetToken, hashedtoken } = createHashedToken();

    const updatedMember = await Member.findByIdAndUpdate(existingMember._id, {
      passwordResetToken: hashedtoken,
      passwordExpiredAt: Date.now() + 10 * 60 * 1000,
    });

    const result = await sendResetPasswordEmail(
      "adeniranbayogold@gmail.com",
      ` ${existingMember.firstName}${" "}${existingMember.lastName}`,
      resetToken
    );

    if (!result) {
      return next(new AppError("Error sending reset token to email", 500));
    }
    res.status(200).json({
      status: "success",
      message: `Password reset token sent to ${existingMember.email} `,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const hashedPassword = await hashPassword(req.body.newPassword);

    const member = await Member.findOneAndUpdate(
      {
        passwordResetToken: token,
        passwordExpiredAt: { $gt: Date.now() },
      },
      {
        $set: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordExpiredAt: null,
        },
      }
    );
    if (!member) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    res.status(200).json({
      status: "success",
      message: `Reset password successfull`,
    });
  } catch (error) {
    next(error);
  }
};
