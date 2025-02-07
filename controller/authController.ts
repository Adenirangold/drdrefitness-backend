import e, { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Member from "../models/member";
import {
  comparePasswords,
  createHashedToken,
  sendAuthResponse,
} from "../lib/util";
import sendEmail from "../utils/email";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const prevUser = await Member.findOne({ email: req.body.email });
    if (prevUser) {
      return next(
        new AppError(
          "This user already exists, please use a different email",
          401
        )
      );
    }
    const newMember = new Member(req.body);
    const savedMember = await newMember.save();
    savedMember.password = "";

    if (!savedMember) {
      return next(new AppError("Error creating new member", 500));
    }

    sendAuthResponse(res, savedMember._id, savedMember.email);
  } catch (error) {
    console.log(error);

    next(new AppError("Error occured in creating new member", 500));
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

    const isMatch = await comparePasswords(password, existingMember.password);
    existingMember.password = "";

    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    sendAuthResponse(res, existingMember._id, existingMember.email);
  } catch (error) {
    console.log(error);

    next(new AppError("Error occured logging in member", 500));
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

    const result = sendEmail({
      to: "adeniranbayogold@gmail.com",
      subject: "Reset Your Drdrefitness Account Password",
      text: `Hello ${existingMember.firstName},

    We received a request to reset your password. If you didn't request this, please ignore this email. Otherwise, click the link below to reset your password:

    (http://localhost:3000/reset-password/${resetToken})

    This link will expire in 10 minute for security reasons. After that, you will need to request another reset.

    If you have any questions or need further assistance, feel free to reply to this email.

    Thank you.`,
    });

    if (!result) {
      return next(new AppError("Error sending reset token to email", 500));
    }
    res.status(200).json({
      status: "success",
      message: `Reset token sent `,
    });
  } catch (error) {
    next(new AppError("Error occured in resetting password", 500));
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(new AppError("Error occured in resetting password", 500));
  }
};
