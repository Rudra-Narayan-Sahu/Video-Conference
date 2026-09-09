import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { config } from "../config/env.js";

const connections = {};
const messages = {};
const timeOnline = {};

// Track message rate limiting per socket ID
const socketRateMap = new Map();

/**
 * Socket.IO rate limiting check
 * Returns true if rate limit exceeded, false otherwise
 */
const isRateLimited = (socketId, maxPerSec = 30) => {
  const now = Date.now();
  const rateData = socketRateMap.get(socketId) || { count: 0, resetTime: now + 1000 };

  if (now > rateData.resetTime) {
    rateData.count = 1;
    rateData.resetTime = now + 1000;
    socketRateMap.set(socketId, rateData);
    return false;
  }

  rateData.count += 1;
  if (rateData.count > maxPerSec) {
    return true;
  }

  socketRateMap.set(socketId, rateData);
  return false;
};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Socket connection origin check
        if (!origin || config.isDevelopment) {
          return callback(null, true);
        }
        const isAllowed = config.cors.allowedOrigins.some(allowed => {
          if (allowed === "*") return true;
          return origin === allowed;
        });
        if (isAllowed) return callback(null, true);
        return callback(new Error("Socket CORS rejected"));
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    maxHttpBufferSize: 1e6, // 1MB payload buffer limit
    pingTimeout: 20000,
    pingInterval: 25000,
    transports: ["websocket", "polling"]
  });

  // Setup Redis Adapter for multi-instance horizontal scaling if configured
  if (config.redis.url) {
    try {
      const pubClient = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => (times > 5 ? null : Math.min(times * 100, 2000))
      });
      const subClient = pubClient.duplicate();

      pubClient.on("error", (err) => console.warn("[Redis Adapter] PubClient notice:", err.message));
      subClient.on("error", (err) => console.warn("[Redis Adapter] SubClient notice:", err.message));

      Promise.all([pubClient.ping(), subClient.ping()])
        .then(() => {
          io.adapter(createAdapter(pubClient, subClient));
          console.log("✅ Socket.IO Redis Adapter successfully attached for horizontal clustering.");
        })
        .catch((err) => {
          console.warn("⚠️ Redis unavailable, continuing with in-memory Socket.IO adapter:", err.message);
        });
    } catch (err) {
      console.warn("⚠️ Could not initialize Redis Socket.IO adapter, using in-memory mode:", err.message);
    }
  } else {
    console.log("ℹ️ Socket.IO running in standalone in-memory mode (Set REDIS_URL to enable multi-node sync).");
  }

  io.on("connection", (socket) => {
    // 1. Join room / call with sanitization
    socket.on("join-call", (rawPath) => {
      if (!rawPath || typeof rawPath !== "string") return;

      // Sanitize room path
      const path = rawPath.trim().substring(0, 100);
      if (!path) return;

      if (connections[path] === undefined) {
        connections[path] = [];
      }

      if (!connections[path].includes(socket.id)) {
        connections[path].push(socket.id);
      }

      timeOnline[socket.id] = new Date();
      socket.join(path);

      // Notify all peers in room
      connections[path].forEach((peerId) => {
        io.to(peerId).emit("user-joined", socket.id, connections[path]);
      });

      // Send previous chat messages to newly joined peer
      if (messages[path] !== undefined) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"]
          );
        });
      }
    });

    // 2. WebRTC Signaling with payload validation & rate limiting
    socket.on("signal", (toId, message) => {
      if (isRateLimited(socket.id, 50)) {
        return; // Drop excessive signaling messages
      }

      if (!toId || !message || typeof toId !== "string" || typeof message !== "string") return;
      // Prevent oversized payloads (> 64KB)
      if (message.length > 65536) return;

      io.to(toId).emit("signal", socket.id, message);
    });

    // 3. Chat Messages with sanitization, length limits, and throttling
    socket.on("chat-message", (rawData, rawSender) => {
      if (isRateLimited(socket.id, 10)) {
        socket.emit("rate-limit-warning", { message: "You are sending messages too quickly." });
        return;
      }

      if (!rawData || typeof rawData !== "string") return;

      // Sanitize text and sender
      const data = rawData.trim().substring(0, 2000);
      const sender = typeof rawSender === "string" ? rawSender.trim().substring(0, 50) : "Participant";

      if (!data) return;

      // Find matching room
      let matchingRoom = null;
      for (const [room, peers] of Object.entries(connections)) {
        if (peers.includes(socket.id)) {
          matchingRoom = room;
          break;
        }
      }

      if (matchingRoom) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        const msgObj = {
          sender: sender || "Participant",
          data: data,
          "socket-id-sender": socket.id,
          time: Date.now()
        };

        // Keep last 100 messages in memory per room
        if (messages[matchingRoom].length > 100) {
          messages[matchingRoom].shift();
        }

        messages[matchingRoom].push(msgObj);

        // Broadcast to all participants in this room only
        connections[matchingRoom].forEach((peerId) => {
          io.to(peerId).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    // 4. Handle Disconnect / Leave
    const handleDisconnect = () => {
      socketRateMap.delete(socket.id);

      for (const [room, peers] of Object.entries(connections)) {
        const index = peers.indexOf(socket.id);
        if (index !== -1) {
          peers.splice(index, 1);

          // Notify remaining peers in the room
          peers.forEach((peerId) => {
            io.to(peerId).emit("user-left", socket.id);
          });

          // Clean up empty room
          if (peers.length === 0) {
            delete connections[room];
            delete messages[room];
          }
        }
      }

      delete timeOnline[socket.id];
    };

    socket.on("user-left", handleDisconnect);
    socket.on("disconnect", handleDisconnect);
  });

  return io;
};
