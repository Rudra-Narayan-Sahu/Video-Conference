import httpStatus from "http-status-codes";
import { config } from "../config/env.js";

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  return res.status(httpStatus.NOT_FOUND).json({
    success: false,
    error: "NotFound",
    message: `Resource not found: [${req.method}] ${req.originalUrl}`
  });
};

/**
 * Centralized Global Error Handler
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Check for JSON parser syntax error in request body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "MalformedJsonBody",
      message: "The JSON payload in the request body is malformed and could not be parsed."
    });
  }

  // Handle CORS policy error
  if (err.message && err.message.includes("CORS policy violation")) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      error: "CorsForbidden",
      message: err.message
    });
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const duplicateKey = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(httpStatus.CONFLICT).json({
      success: false,
      error: "DuplicateRecord",
      message: `A record with this ${duplicateKey} already exists.`
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map(e => e.message);
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "MongooseValidationError",
      message: messages.join(", ") || "Validation failed on database schema"
    });
  }

  // Log full error details on server
  console.error(`[Unhandled Error] [${req.method} ${req.url}]:`, err);

  const statusCode = err.statusCode || err.status || httpStatus.INTERNAL_SERVER_ERROR;

  return res.status(statusCode).json({
    success: false,
    error: err.name || "InternalServerError",
    message: config.isProduction ? "An unexpected server error occurred." : (err.message || "Internal server error"),
    ...(config.isDevelopment && { stack: err.stack })
  });
};
