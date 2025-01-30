import z from "zod";
import { Request, Response, NextFunction } from "express";

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

        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };
};
export default validateRequest;
