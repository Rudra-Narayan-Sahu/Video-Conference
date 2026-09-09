import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Meeting } from "../models/mettingSchema.js";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

// In-memory resilient fallback stores if MongoDB is temporarily unavailable
const memoryUsers = [];
const memoryMeetings = [];

/**
 * Helper to determine if active MongoDB connection is available
 */
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Generate standardized JWT token
 */
const generateAuthToken = (user) => {
  const userId = (user._id || user.id).toString();
  return jwt.sign(
    {
      id: userId,
      userId: userId,
      username: user.username,
      name: user.name
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
      algorithm: config.jwt.algorithm
    }
  );
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = String(username).trim().toLowerCase();

    let user = null;
    if (isDbConnected()) {
      try {
        user = await User.findOne({ username: cleanUsername });
      } catch (dbErr) {
        user = memoryUsers.find(u => u.username === cleanUsername);
      }
    } else {
      user = memoryUsers.find(u => u.username === cleanUsername);
    }

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        error: "InvalidCredentials",
        message: "Invalid username or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        error: "InvalidCredentials",
        message: "Invalid username or password"
      });
    }

    const token = generateAuthToken(user);

    if (isDbConnected() && user.save) {
      try {
        user.token = token;
        await user.save();
      } catch (saveErr) {
        // Non-blocking
      }
    } else {
      user.token = token;
    }

    const safeUser = {
      _id: (user._id || user.id).toString(),
      name: user.name,
      username: user.username
    };

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser
    });
  } catch (error) {
    console.error("[Login Error]:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "ServerError",
      message: "Internal server error during login"
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const cleanName = String(name).trim();
    const cleanUsername = String(username).trim().toLowerCase();

    let existingUser = null;
    if (isDbConnected()) {
      try {
        existingUser = await User.findOne({ username: cleanUsername });
      } catch (dbErr) {
        existingUser = memoryUsers.find(u => u.username === cleanUsername);
      }
    } else {
      existingUser = memoryUsers.find(u => u.username === cleanUsername);
    }

    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({
        success: false,
        error: "UserAlreadyExists",
        message: "A user with this username already exists"
      });
    }

    // Hash password with secure 12-round salt
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = Date.now().toString();

    const newUserObj = {
      _id: userId,
      id: userId,
      name: cleanName,
      username: cleanUsername,
      password: hashedPassword
    };

    const token = generateAuthToken(newUserObj);
    newUserObj.token = token;

    if (isDbConnected()) {
      try {
        const newUser = new User(newUserObj);
        await newUser.save();
      } catch (dbErr) {
        memoryUsers.push(newUserObj);
      }
    } else {
      memoryUsers.push(newUserObj);
    }

    return res.status(httpStatus.CREATED).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: userId,
        name: cleanName,
        username: cleanUsername
      }
    });
  } catch (error) {
    console.error("[Register Error]:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "ServerError",
      message: "Internal server error during registration"
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { username } = req.params;
    const cleanUsername = String(username).trim().toLowerCase();

    let user = null;
    if (isDbConnected()) {
      try {
        user = await User.findOne({ username: cleanUsername }).select("-password");
      } catch (err) {
        const memoryUser = memoryUsers.find(u => u.username === cleanUsername);
        if (memoryUser) {
          const { password, ...safe } = memoryUser;
          user = safe;
        }
      }
    } else {
      const memoryUser = memoryUsers.find(u => u.username === cleanUsername);
      if (memoryUser) {
        const { password, ...safe } = memoryUser;
        user = safe;
      }
    }

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        error: "NotFound",
        message: "User not found"
      });
    }

    return res.status(httpStatus.OK).json({ success: true, user });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "ServerError",
      message: "Internal server error retrieving user profile"
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized",
        message: "Unauthorized access: Token required"
      });
    }
    return res.status(httpStatus.OK).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "ServerError",
      message: "Internal server error fetching current user profile"
    });
  }
};

export const addToActivity = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized",
        message: "Unauthorized: Valid JWT required to add meeting to history"
      });
    }

    const roomCode = String(req.body.meetingCode || req.body.meeting_code || "").trim();
    if (!roomCode) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        error: "ValidationError",
        message: "Meeting code is required"
      });
    }

    const userId = req.user._id.toString();
    const meetingEntry = {
      user_id: userId,
      meetingCode: roomCode,
      date: new Date()
    };

    if (isDbConnected()) {
      try {
        const newMeeting = new Meeting(meetingEntry);
        await newMeeting.save();
      } catch (dbErr) {
        memoryMeetings.push({ ...meetingEntry, _id: Date.now().toString(), createdAt: new Date() });
      }
    } else {
      memoryMeetings.push({ ...meetingEntry, _id: Date.now().toString(), createdAt: new Date() });
    }

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Added meeting to history successfully"
    });
  } catch (error) {
    console.error("[addToActivity Error]:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "ServerError",
      message: "Internal server error recording meeting activity"
    });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized",
        message: "Unauthorized: Valid JWT required to retrieve meeting history"
      });
    }

    const userId = req.user._id.toString();
    let meetings = [];

    if (isDbConnected()) {
      try {
        meetings = await Meeting.find({ user_id: userId }).sort({ createdAt: -1, date: -1 });
      } catch (dbErr) {
        meetings = memoryMeetings.filter(m => m.user_id === userId).reverse();
      }
    } else {
      meetings = memoryMeetings.filter(m => m.user_id === userId).reverse();
    }

    return res.status(httpStatus.OK).json(meetings);
  } catch (error) {
    console.error("[getUserActivity Error]:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "ServerError",
      message: "Internal server error retrieving activity history"
    });
  }
};

export {
  loginUser as login,
  registerUser as register,
  addToActivity as add_to_activity,
  getUserActivity as get_all_activity
};
