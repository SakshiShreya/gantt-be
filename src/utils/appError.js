class AppError extends Error {
  /**
   *
   * @param {string} message message of the error
   * @param {number} statusCode status code of the error
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith("4") ? "fail" : "error";
    this.isOperational = true; // used in prod to check if error is coming via AppError or not

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
