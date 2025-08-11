import User from "../models/user-model.js";
import { hashPassword, hashRefreshToken } from "../utils/auth-util.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response-util.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token-util.js";
import { validateUserRegistration } from "../validations/auth-validations.js";


export const registerNewUser = async (req, res) => {
  try {
    const { email, password, userRole } = req.body;

    // Validate input data
    const validationErrors = validateUserRegistration(req.body);
    if (validationErrors.length > 0) {
      return sendErrorResponse(res, 400, "Validation errors", validationErrors);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendErrorResponse(res, 400, "A user with this email already exists");
    }

    // Hash password and create the user record
    const encryptedPassword = await hashPassword(password);
    const newUser = await User.create({
      userRole,
      email,
      password: encryptedPassword
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Hash refresh token and store in DB
    const encryptedRefreshToken = await hashRefreshToken(refreshToken);
    newUser.refreshToken = encryptedRefreshToken;
    await newUser.save();

    // Send refresh token via secure HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // prevents JavaScript access
      secure: true,   // only sent over HTTPS
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Prepare user data for response (omit sensitive info)
    const userData = {
      userRole: newUser.userRole,
      name: newUser.name,
      email: newUser.email,
      contactNumber: newUser.contactNumber
    };

    // Send success response
    return sendSuccessResponse(res, 201, "User registered successfully", {
      accessToken,
      user: userData
    });

  } catch (error) {
    // Handle server errors
    sendErrorResponse(res, 500, "Internal Server Error", error);
  }
};
