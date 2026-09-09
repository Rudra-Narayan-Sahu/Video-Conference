import { Router } from "express";
import { 
  login, 
  register, 
  getUser, 
  getProfile, 
  addToActivity, 
  getUserActivity 
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authLimiter, meetingLimiter } from "../middlewares/rateLimiter.js";
import { 
  validateLogin, 
  validateRegister, 
  validateMeetingActivity 
} from "../middlewares/validation.middleware.js";

const router = Router();

// Public Authentication Endpoints with Strict Brute-Force Rate Limiting & Input Validation
router.post("/login", authLimiter, validateLogin, login);
router.post("/register", authLimiter, validateRegister, register);

// Protected Meeting Activity Endpoints (Strict JWT + Meeting rate limiting + input validation)
router.post("/add_to_activity", authMiddleware, meetingLimiter, validateMeetingActivity, addToActivity);
router.post("/addToActivity", authMiddleware, meetingLimiter, validateMeetingActivity, addToActivity);

// Protected Activity & Profile Queries
router.get("/get_all_activity", authMiddleware, getUserActivity);
router.get("/getAllActivity", authMiddleware, getUserActivity);
router.get("/history", authMiddleware, getUserActivity);
router.get("/profile", authMiddleware, getProfile);

// Protected User Lookup Routes
router.get("/users/:username", authMiddleware, getUser);
router.get("/:username", authMiddleware, getUser);

export default router;