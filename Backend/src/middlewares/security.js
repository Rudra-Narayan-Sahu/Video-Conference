import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import { config } from "../config/env.js";

/**
 * Helmet HTTP security headers configured specifically for WebRTC & API workloads
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      mediaSrc: ["'self'", "blob:", "mediastream:"],
      connectSrc: [
        "'self'",
        "ws:",
        "wss:",
        "http:",
        "https:",
        "stun:*",
        "turn:*"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: config.isProduction ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // Required for WebRTC canvas and stream access
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

/**
 * Enterprise CORS configuration
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser clients, mobile apps, or local curl/Postman (where origin is undefined)
    if (!origin) {
      return callback(null, true);
    }

    // In development mode, allow localhost and LAN IPs automatically
    if (config.isDevelopment) {
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("192.168.") ||
        origin.includes("10.0.")
      ) {
        return callback(null, true);
      }
    }

    // Check against configured allowed origins
    const isAllowed = config.cors.allowedOrigins.some(allowed => {
      if (allowed === "*") return true;
      if (allowed.startsWith("*.")) {
        const domain = allowed.slice(2);
        return origin.endsWith(domain);
      }
      return origin === allowed;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy violation: Origin '${origin}' is not authorized to access this API.`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "x-access-token"
  ],
  exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset", "Retry-After"],
  credentials: true,
  maxAge: 86400 // 24 hours preflight cache
});

/**
 * Recursive in-place NoSQL Injection Sanitizer (Express 5 compatible)
 * Strips out any keys starting with "$" or containing "."
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return;
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.startsWith("$") || key.includes(".")) {
      const sanitizedKey = key.replace(/^\$|\./g, "_");
      obj[sanitizedKey] = obj[key];
      delete obj[key];
      sanitizeObject(obj[sanitizedKey]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

export const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  if (req.query && typeof req.query === "object") {
    try {
      sanitizeObject(req.query);
    } catch (e) {
      // Ignore getter restrictions on read-only queries
    }
  }
  next();
};

/**
 * HTTP Parameter Pollution Protection
 */
export const hppMiddleware = hpp();
