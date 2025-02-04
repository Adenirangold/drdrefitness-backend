import { NextFunction } from "express";
import AppError from "../utils/AppError";
import jwt from "jsonwebtoken";

const autheticateMember = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.get("Authorization")?.split(" ")[1];
      if (!token) {
        return next(new AppError("Unauthorized", 401));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      if (!decoded) {
        return next(new AppError("Unauthorized", 401));
      }
    } catch (error) {}
  };
};
export default autheticateMember;
