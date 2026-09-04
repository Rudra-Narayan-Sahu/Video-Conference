import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import { connectToSocket } from "./controllers/socketManeger.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

const server = createServer(app);
const io = connectToSocket(server);
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const startServer = async () => {
    const connectWithRetry = async () => {
        try {
            const connectiondb = await mongoose.connect(process.env.db);
            console.log("MongoDB connected successfully at ", connectiondb.connection.host);
        } catch (err) {
            console.error("MongoDB connection attempt failed, retrying in 2 seconds...", err.message);
            setTimeout(connectWithRetry, 2000);
        }
    };

    connectWithRetry();

    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();