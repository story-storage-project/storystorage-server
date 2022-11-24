export default class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.status = `${statusCode}`.startsWith('4') ? statusCode : 500;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
