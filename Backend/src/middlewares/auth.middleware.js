import jwt from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { config } from "../config/env.js";

/**
 * Hardened JWT Authentication Middleware
 * Enforces valid cryptographic signatures, active expiration, and attaches the sanitized user object
 */
export const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization Header (Bearer format preferred)
    const authHeader = req.headers.authorization || req.headers["x-access-token"];
    if (authHeader) {
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
      } else if (typeof authHeader === "string") {
        token = authHeader.trim();
      }
    }

    // 2. Fallback check for query param (e.g. WebSocket handshake or download)
    if (!token && req.query && req.query.token) {
      token = String(req.query.token).trim();
    }

    // 3. Fallback check for body token
    if (!token && req.body && req.body.token) {
      token = String(req.body.token).trim();
    }

    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized",
        message: "Access Denied: No authentication token provided. Please log in to continue."
      });
    }

    // Verify token with configured secret
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: [config.jwt.algorithm]
      });

      if (!decoded || (!decoded.id && !decoded.userId && !decoded._id)) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          error: "InvalidToken",
          message: "Access Denied: The provided token has an invalid payload."
        });
      }

      const userId = (decoded.id || decoded.userId || decoded._id).toString();

      // Attach verified sanitized user payload to request
      req.user = {
        _id: userId,
        id: userId,
        username: decoded.username ? String(decoded.username).toLowerCase() : undefined,
        name: decoded.name || decoded.username || "User",
        tokenIssuedAt: decoded.iat,
        tokenExpiresAt: decoded.exp
      };

      return next();
    } catch (jwtErr) {
      if (jwtErr.name === "TokenExpiredError") {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          error: "TokenExpired",
          message: "Session expired: Your authentication token has expired. Please log in again."
        });
      }

      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        error: "InvalidToken",
        message: "Access Denied: Invalid authentication signature. Access rejected."
      });
    }
  } catch (error) {
    console.error("[Auth Middleware Error]:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "AuthServerError",
      message: "An internal security error occurred during authentication verification."
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but allows unauthenticated access if no token is provided
 */
export const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }
  return authMiddleware(req, res, next);
};
