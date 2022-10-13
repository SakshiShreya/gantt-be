import AppError from "../../utils/appError.js";
import nodeLogger, { Type } from "../../utils/logger.js";

/**
 * Function to show error message in development environment
 * @param {AppError} err error object
 * @param {Express.Response} res response object
 */
function sendErrorForDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
}

/**
 * if _id string format is wrong and mongo is having trouble casting it to ObjectId
 * @param {import("mongoose").CastError} err Error object
 * @returns new AppError object
 */
function handleCastError(err) {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
}

/**
 * If duplicate entry is created in DB
 * @param err Error object
 * @returns new AppError object
 */
function handleDuplicateFields(err) {
  const message = `Duplicate field value ${err.keyValue.name}. Please use another value.`;
  return new AppError(message, 400);
}

/**
 * If any field is invalid
 * @param {import("mongoose").Error.ValidationError} err Error object
 * @returns new AppError object
 */
function handleValidationError(err) {
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
  return new AppError("Your token has expired. Please login again", 401);
}

/**
 * Function to show error message in production environment
 * @param {AppError} err error object
 * @param {Express.Response} res response object
 */
function sendErrorForProd(err, res) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // if programming error, don't leak error details
  // 1. Log error
  nodeLogger({
    description: `Error: ${err}`,
    type: Type.error,
    ref: err,
  });

  // 2. Send generic message
  res.status(500).json({
    status: "error",
    message: "Something went very wrong",
  });
}

/**
 * handles all errors even if missed by any controller
 * @param {*} err error object
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.NextFunction} next next function
 */
export default function errorController(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
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
    if (err.name === "ValidationError") {
      error = handleValidationError(error);
    }
    if (err.name === "JsonWebTokenError") {
      error = handleJwtError();
    }
    if (err.name === "TokenExpiredError") {
      error = handleJwtExpiredError();
    }

    sendErrorForProd(err, res);
  }
}
