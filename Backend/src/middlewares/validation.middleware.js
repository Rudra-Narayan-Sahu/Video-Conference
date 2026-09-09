import httpStatus from "http-status-codes";

/**
 * Validates registration payload
 */
export const validateRegister = (req, res, next) => {
  const { name, username, password } = req.body || {};

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "ValidationError",
      message: "Full name is required and must be at least 2 characters long."
    });
  }

  if (name.trim().length > 70) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "ValidationError",
      message: "Full name cannot exceed 70 characters."
    });
  }

  if (!username || typeof username !== "string") {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "ValidationError",
      message: "Username is required."
    });
  }

  const cleanUsername = username.trim().toLowerCase();
  const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;

  if (!usernameRegex.test(cleanUsername)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "ValidationError",
      message: "Username must be between 3 and 30 characters and can only contain letters, numbers, underscores, dots, or hyphens."
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "ValidationError",
      message: "Password must be at least 6 characters long."
    });
  }

  if (password.length > 128) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "ValidationError",
      message: "Password is too long (maximum 128 characters)."
    });
  }

  // Attach sanitized inputs
  req.body.name = name.trim();
  req.body.username = cleanUsername;

  next();
};

/**
 * Validates login payload
 */
export const validateLogin = (req, res, next) => {
  const { username, password } = req.body || {};

  if (!username || typeof username !== "string" || !username.trim()) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "ValidationError",
      message: "Username is required to log in."
    });
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "ValidationError",
      message: "Password is required to log in."
    });
  }

  req.body.username = username.trim().toLowerCase();
  next();
};

/**
 * Validates meeting history / activity payload
 */
export const validateMeetingActivity = (req, res, next) => {
  const code = req.body?.meetingCode || req.body?.meeting_code;

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "ValidationError",
      message: "Meeting code is required."
    });
  }

  const cleanCode = code.trim();
  const codeRegex = /^[a-zA-Z0-9_-]{3,64}$/;

  if (!codeRegex.test(cleanCode)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      error: "ValidationError",
      message: "Invalid meeting code format. Only alphanumeric characters, dashes, and underscores (3-64 chars) are permitted."
    });
  }

  req.body.meetingCode = cleanCode;
  next();
};
