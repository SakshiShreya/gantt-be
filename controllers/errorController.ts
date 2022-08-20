import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";

function sendErrorForDev(err: AppError, res: Response) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
}

function sendErrorForProd(err: AppError, res: Response) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // if programming error, don't leak error details
  // 1. Log error TODO: Use a logger here
  console.error("Error: ", err);

  // 2. Send generic message
  res.status(500).json({
    status: "error",
    message: "Something went very wrong"
  })
}

export default (err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if ((process.env.NODE_ENV = "development")) {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorForProd(err, res);
  }
};
