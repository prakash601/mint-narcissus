/**
 * Operational application error — safe to send message to the client.
 */
export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} [statusCode=400]
   * @param {{ code?: string, details?: unknown }} [options]
   */
  constructor(message, statusCode = 400, options = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message, details) {
    return new AppError(message, 400, { code: "BAD_REQUEST", details });
  }

  static unauthorized(message = "Not authenticated. Please login.") {
    return new AppError(message, 401, { code: "UNAUTHORIZED" });
  }

  static forbidden(message = "Access denied.") {
    return new AppError(message, 403, { code: "FORBIDDEN" });
  }

  static notFound(message = "Resource not found.") {
    return new AppError(message, 404, { code: "NOT_FOUND" });
  }

  static conflict(message) {
    return new AppError(message, 409, { code: "CONFLICT" });
  }
}

export default AppError;
