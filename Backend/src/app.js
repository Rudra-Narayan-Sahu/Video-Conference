import express from "express";
import mongoose from "mongoose";
import compression from "compression";
import morgan from "morgan";
import { createServer } from "node:http";

import { config } from "./config/env.js";
import { 
  helmetMiddleware, 
  corsMiddleware, 
  mongoSanitizeMiddleware, 
  hppMiddleware 
} from "./middlewares/security.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { notFoundHandler, globalErrorHandler } from "./middlewares/errorHandler.js";
import userRoutes from "./routes/user.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { connectToSocket } from "./controllers/socketManeger.js";

const app = express();

// Trust reverse proxy (Nginx / ALB / Cloudflare) to ensure accurate IP rate limiting and SSL detection
app.set("trust proxy", 1);

// 1. Core Security & Compression Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compression());

// 2. Request Logging
if (config.isProduction) {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// 3. Body Parsers with Strict Size Limits
app.use(express.json({ limit: config.bodyLimits.json }));
app.use(express.urlencoded({ extended: true, limit: config.bodyLimits.urlencoded }));

// 4. Input Sanitization & Parameter Pollution Guard
app.use(mongoSanitizeMiddleware);
app.use(hppMiddleware);

// 5. Global API Rate Limiting
app.use(apiLimiter);

// 6. Create HTTP server and bind Socket.IO
const server = createServer(app);
const io = connectToSocket(server);

// Attach io to app and request context
app.set("io", io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 7. Route Handlers
app.use("/", healthRoutes);
app.use("/api/v1/system", healthRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/users", userRoutes);

// Root information endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "AuraMeet Enterprise WebRTC API",
    version: "1.0.0",
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

// 8. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Database Connection & Server Initialization
let isShuttingDown = false;

const startServer = () => {
  server.listen(config.port, () => {
    console.log(`🚀 AuraMeet Production Server running on port ${config.port} [PID: ${process.pid}]`);
  });

  if (config.mongoUri) {
    mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    }).then((connectiondb) => {
      console.log(`✅ MongoDB connected successfully to [${connectiondb.connection.host}] in ${config.env} mode`);
    }).catch((err) => {
      console.warn("⚠️ MongoDB connection notice (using resilient fallback store):", err.message);
    });
  }
};


// Graceful Shutdown Management
const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    console.log("🔒 HTTP server closed.");

    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close(false);
        console.log("💾 MongoDB connection gracefully closed.");
      }
    } catch (err) {
      console.error("Error during MongoDB disconnect:", err);
    }

    console.log("👋 Process terminated cleanly.");
    process.exit(0);
  });

  // Force close after 10 seconds timeout
  setTimeout(() => {
    console.error("⏱️ Forcefully terminating process after shutdown timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

startServer();

export { app, server, io };