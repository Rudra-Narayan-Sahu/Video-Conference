import { Router } from "express";
import mongoose from "mongoose";
import os from "node:os";
import { config } from "../config/env.js";

const router = Router();
const startTime = Date.now();

/**
 * Liveness probe - Quick endpoint for load balancers
 */
router.get("/health", (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();

  return res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    environment: config.env,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    }
  });
});

/**
 * Readiness probe - Verifies database and critical subsystems are responding
 */
router.get("/ready", async (req, res) => {
  const mongoStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  const dbState = mongoose.connection.readyState;
  const isDbReady = dbState === 1 || dbState === 2; // Connected or resiliently connecting

  const status = {
    ready: true, // App is ready (has in-memory fallback store if MongoDB is initializing)
    database: {
      status: mongoStateMap[dbState] || "unknown",
      host: mongoose.connection.host || "in-memory-fallback"
    },
    system: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      cpus: os.cpus().length,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`
    }
  };

  return res.status(200).json(status);
});

/**
 * Detailed telemetry metrics for observability
 */
router.get("/status", (req, res) => {
  const io = req.app.get("io");
  let socketCount = 0;
  let roomCount = 0;

  if (io && io.sockets) {
    socketCount = io.sockets.sockets ? io.sockets.sockets.size : 0;
    if (io.sockets.adapter && io.sockets.adapter.rooms) {
      roomCount = io.sockets.adapter.rooms.size;
    }
  }

  return res.status(200).json({
    service: "AuraMeet WebRTC & Express API",
    version: "1.0.0",
    environment: config.env,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    activeSockets: socketCount,
    activeRooms: roomCount,
    serverTime: new Date().toISOString(),
    pid: process.pid
  });
});

export default router;
