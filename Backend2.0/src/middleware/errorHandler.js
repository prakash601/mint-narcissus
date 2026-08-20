import { ZodError } from "zod";
import { AppError } from "../shared/errors/AppError.js";
import { createLogger } from "../shared/logger/index.js";
import { env } from "../config/env.js";

const logger = createLogger("error-handler");

/**
 * Central Express error middleware. Must be registered last.
 */
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
  }

  // Multer errors
  if (err?.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: "UPLOAD_ERROR",
    });
  }

  logger.error("Unhandled error", err instanceof Error ? err : new Error(String(err)));

  const status = err.status || err.statusCode || 500;
  // Never leak internal messages/stack to client; hide in production and
  // for 5xx in any env. 4xx from Zod/AppError are already handled above.
  const isServerError = status >= 500;
  res.status(status).json({
    success: false,
    message: env.isProduction || isServerError ? "Internal server error" : "Unexpected error",
    code: "INTERNAL_ERROR",
  });
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: "NOT_FOUND",
  });
}

export default errorHandler;
