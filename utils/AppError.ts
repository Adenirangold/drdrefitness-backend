class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  validationErrors?: any;
  code?: number;
  value?: any;
  errors?: any;
  keyValue?: any;
  constructor(message: string, statusCode: number, validationErrors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.validationErrors = validationErrors;

    Error.captureStackTrace(this, this.constructor);
  }
}
export default AppError;
