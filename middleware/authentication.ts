import { NextFunction, RequestHandler, Response } from "express";
import AppError from "../utils/AppError";
import jwt from "jsonwebtoken";
import Member from "../models/member";
import { memberSchema } from "../utils/schema";
import { Role } from "../types";
import { Request } from "express-serve-static-core";

const hasAccess = (userRole: Role, requiredRole: Role) => {
  const rolesHierarchy =
    memberSchema.innerType().shape.role._def.innerType._def.values;

  return (
    rolesHierarchy.indexOf(userRole) >= rolesHierarchy.indexOf(requiredRole)
  );
};

const autheticateMember = (requiredRole: Role): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers["authorization"];
      const token =
        req.cookies.authToken ||
        (authHeader?.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : undefined);

      if (!token) {
        return next(new AppError("Unauthorized", 401));
      }
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as jwt.JwtPayload;

      if (!decodedToken) {
        return next(new AppError("Invalid Token", 401));
      }
      const decodedMember = await Member.findById(decodedToken.id)
        .populate("membershipHistory.plan")
        .populate({
          path: "groupSubscription.dependantMembers.member",
          model: "Member",
          select: "firstName lastName email phoneNumber",
        });
      if (!decodedMember) {
        return next(new AppError("Member with token not found", 404));
      }

      decodedMember.password = "";

      const role = decodedMember?.role!;
      if (!hasAccess(role, requiredRole)) {
        return next(new AppError("Unauthorized", 401));
      }

      req.user = decodedMember;

      next();
    } catch (error) {
      next(error);
    }
  };
};
export default autheticateMember;
