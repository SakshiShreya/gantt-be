import { NextFunction, Request, Response } from "express";
import { CastError, Error } from "mongoose";
import AppError from "../utils/appError";

function sendErrorForDev(err: AppError, res: Response) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
}

/**
 * if _id string format is wrong and mongo is having trouble casting it to ObjectId
 * @param err Error object
 * @returns new AppError object
 */
function handleCastError(err: CastError) {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
}

/**
 * If duplicate entry is created in DB
 * @param err Error object
 * @returns new AppError object
 */
function handleDuplicateFields(err: any) {
  const message = `Duplicate field value ${err.keyValue.name}. Please use another value.`;
  return new AppError(message, 400);
}

/**
 * If any field is invalid
 * @param err Error object
 * @returns new AppError object
 */
function handleValidationError(err: Error.ValidationError) {
  return new AppError(err.message, 400);
}

/**
 * If user is unauthorized
 * @returns new AppError object
 */
function handleJwtError() {
  return new AppError("Invalid token. Please log in again.", 401);
}

/**
 * If user session is expired
 * @returns new AppError object
 */
function handleJwtExpiredError() {
  new AppError('Your token has expired. Please login again', 401);
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
  });
}

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if ((process.env.NODE_ENV = "development")) {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    // MongoDB specific errors
    if (error.name === "CastError") {
      error = handleCastError(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateFields(error);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJwtError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJwtExpiredError();
    }

    sendErrorForProd(err, res);
  }
};
