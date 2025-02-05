import { NextFunction } from "express";
import AppError from "../utils/AppError";
import jwt from "jsonwebtoken";
import Member from "../models/member";
import { memberSchema } from "../utils/schema";
import { Role } from "../types";
import { Request } from "express-serve-static-core";

const hasAccess = (userRole: Role, requiredRole: Role) => {
  const rolesHierarchy = memberSchema.shape.role._def.innerType._def.values;

  return (
    rolesHierarchy.indexOf(userRole) >= rolesHierarchy.indexOf(requiredRole)
  );
};

const autheticateMember = (requiredRole: Role) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];

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
      const decodedMember = await Member.findById(decodedToken.id);
      console.log(decodedMember);
      const role = decodedMember?.role!;
      if (!hasAccess(role, requiredRole)) {
        return next(new AppError("Unauthorized", 401));
      }

      req.user = decodedMember;
      next();
    } catch (error) {
      next(new AppError("Unauthorized", 401));
    }
  };
};
export default autheticateMember;
