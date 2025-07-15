import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { Error as MongooseError } from "mongoose";
import AppError from "../utils/AppError";

const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token. Please log in again.", 401);
    error.isOperational = true;
  }

  // Mongoose CastError (Invalid ID)
  if (err.name === "CastError") {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    error = new AppError(`Invalid input: ${errors.join(". ")}`, 400);
    error.validationErrors = Object.values(err.errors).map((el: any) => ({
      field: el.path,
      message: el.message,
      value: el.value,
    }));
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new AppError(
      `The ${field} '${value}' is already in use. Please choose a different one.`,
      400
    );
  }

  // Mongoose ValidationError (Single)
  if (err instanceof MongooseError.ValidatorError) {
    error = new AppError(err.message, 400);
  }

  // Mongoose Document Version Error
  if (err.name === "VersionError") {
    error = new AppError(
      "A stale version of the document was detected. Please retry with the latest version.",
      409
    );
  }

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  // Development Error Response
  if (process.env.NODE_ENV === "development") {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
      validationErrors: error.validationErrors,
    });
    return;
  }

  // Production Error Response
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      ...(error.validationErrors && {
        validationErrors: error.validationErrors,
      }),
    });
    return;
  }

  // Generic Error for Production (non-operational errors)
  console.error("ERROR 💥", error);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
};

export default errorHandler;
