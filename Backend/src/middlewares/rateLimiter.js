import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";

/**
 * Standardized JSON response handler for rate limit violations
 */
const rateLimitHandler = (message, windowMs) => (req, res) => {
  const retryAfterSec = Math.ceil(windowMs / 1000);
  res.setHeader("Retry-After", retryAfterSec);
  return res.status(429).json({
    success: false,
    error: "TooManyRequests",
    message: message || "Too many requests from this IP, please try again later.",
    retryAfterSeconds: retryAfterSec
  });
};

/**
 * Global API Rate Limiter
 * Applied across all general API routes
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimits.globalWindowMs,
  max: config.rateLimits.globalMax,
  standardHeaders: true, // Return standard RateLimit headers (draft-6 / draft-7)
  legacyHeaders: false, // Disable X-RateLimit-* legacy headers
  handler: rateLimitHandler(
    "Rate limit exceeded: You have made too many API requests. Please wait a few minutes before trying again.",
    config.rateLimits.globalWindowMs
  ),
  skip: (req) => req.path === "/health" || req.path === "/ready" || req.path === "/"
});

/**
 * Strict Authentication Rate Limiter
 * Prevents brute force credential attacks and registration spamming
 */
export const authLimiter = rateLimit({
  windowMs: config.rateLimits.authWindowMs,
  max: config.rateLimits.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler(
    "Security limit reached: Too many authentication attempts from your network. Please try again after 15 minutes.",
    config.rateLimits.authWindowMs
  )
});

/**
 * Meeting Room Action Rate Limiter
 * Prevents automated room creation / flooding
 */
export const meetingLimiter = rateLimit({
  windowMs: config.rateLimits.meetingWindowMs,
  max: config.rateLimits.meetingMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler(
    "Meeting action limit reached: You are creating or modifying meeting sessions too rapidly.",
    config.rateLimits.meetingWindowMs
  )
});
