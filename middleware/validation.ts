import z from "zod";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        const appError = new AppError(
          "Validation failed",
          400,
          formattedErrors
        );

        return next(appError);
      }

      next(new AppError("Internal server error", 500));
    }
  };
};
export default validateRequest;
