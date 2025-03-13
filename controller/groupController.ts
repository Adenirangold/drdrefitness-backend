import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

export const sendGroupInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = req.user;
    console.log(member);

    // const result = await sendGroupInvitationEmail({});

    //   if (!result) {
    //     return next(new AppError("Error sending reset token to email", 500));
    //   }
    res.status(200).json({
      status: "success",
      message: `Reset token sent `,
    });
  } catch (error) {
    next(error);
  }
};
