import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";
import crypto from "crypto";
import {
  comparePasswords,
  createHashedToken,
  hashPassword,
  sendAuthResponse,
} from "../lib/util";
import { sendResetPasswordEmail, sendWelcomeEmail } from "../config/email";
import Plan from "../models/plan";
import {
  paystackInitializePayment,
  paystackVerifyPayment,
} from "../config/paystack";

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

    const plan = await Plan.findById(req.body.currentSubscription.plan);

    if (!plan) {
      return next(new AppError("Invalid subscription plan", 400));
    }

    const paymentResponse = await paystackInitializePayment(
      req.body.email,
      plan.price,
      {
        phoneNumber: req.body.phoneNumber,
        lastName: req.body.lastName,
        firstName: req.body.firstName,
      }
    );

    const newMember = new Member({
      ...req.body,
      currentSubscription: {
        ...req.body.currentSubscription,
        transactionReference: paymentResponse.data.data.reference,
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

    const member = await Member.findOneAndUpdate(
      { "currentSubscription.transactionReference": reference },
      {
        $set: {
          isActive: true,
          "currentSubscription.paymentMethod":
            verificationResponse.payment_type || "card",
          "currentSubscription.subscriptionStatus": "active",
          "currentSubscription.paymentStatus":
            verificationResponse.status === "success" ? "approved" : "declined",
        },
      },
      { new: true }
    );

    if (!member) {
      return next(new AppError("Member not found", 404));
    }

    await sendWelcomeEmail(
      "adeniranbayogold@gmail.com",
      `${member.firstName}${" "}${member.lastName}`
    );

    sendAuthResponse(res, member._id, member.email!);
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
      return next(new AppError("This user does not exist", 401));
    }

    const isMatch = await comparePasswords(password, existingMember.password!);
    existingMember.password = "";

    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    sendAuthResponse(res, existingMember._id, existingMember.email!);
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
      message: `Reset token sent `,
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
