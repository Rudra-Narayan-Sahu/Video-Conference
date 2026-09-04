import { User } from "../models/user.model.js";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "All fields are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      let token = await bcrypt.hash(user._id.toString(), 10);
      user.token = token;
      await user.save();
      return res
        .status(httpStatus.OK)
        .json({ message: "Login successful", token, user });
    }
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "Invalid password" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "All fields are required" });
    }
    const user = await User.findOne({ username });
    if (user) {
      return res
        .status(httpStatus.CONFLICT || httpStatus.FOUND)
        .json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });
    await newUser.save();
    return res
      .status(httpStatus.CREATED)
      .json({ message: "User registered successfully" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export { loginUser, registerUser, loginUser as login, registerUser as register };