import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root of Backend directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_video_conferencing_key_2026_secure";

if (isProduction && JWT_SECRET === "super_secret_jwt_video_conferencing_key_2026_secure") {
  console.warn("⚠️ [SECURITY WARNING] Default JWT_SECRET is being used in production. Please set a strong random JWT_SECRET in your .env file!");
}

export const config = {
  env: NODE_ENV,
  isProduction,
  isDevelopment: NODE_ENV === "development",
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || process.env.db || process.env.DB_URL || "mongodb://127.0.0.1:27017/video-conference",
  jwt: {
    secret: JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    algorithm: "HS256"
  },
  redis: {
    url: process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}` : null),
    enabled: Boolean(process.env.REDIS_URL || process.env.REDIS_HOST)
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
      .split(",")
      .map(origin => origin.trim())
      .filter(Boolean)
  },
  rateLimits: {
    globalWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 mins
    globalMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 150, // 150 requests per window
    authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 mins
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 15, // 15 attempts per 15 min
    meetingWindowMs: parseInt(process.env.MEETING_RATE_LIMIT_WINDOW_MS, 10) || 5 * 60 * 1000,
    meetingMax: parseInt(process.env.MEETING_RATE_LIMIT_MAX, 10) || 60
  },
  bodyLimits: {
    json: "1mb",
    urlencoded: "1mb"
  }
};

export default config;
