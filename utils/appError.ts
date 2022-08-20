class AppError extends Error {
  statusCode: number;
  status: "fail" | "error";
  isOperational: boolean; // used in prod to check if error is coming via AppError or not

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
