import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  validationErrors?: any;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      validationErrors: err.validationErrors,
      message: err.message,
      stack: err.stack,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        validationErrors: err.validationErrors,
      });
    } else {
      console.error("ERROR 💥", err);

      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  }
};

export default errorHandler;
