import User from "../models/user-model.js";
import { comparePasswords, compareRefreshTokens, generateTempPassword, hashPassword, hashRefreshToken, sendTempPasswordEmail } from "../utils/auth-util.js";
import { userRoles } from "../utils/enums/user-role.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response-util.js";
import { blacklistToken, generateAccessToken, generateRefreshToken, verifyEncodedToken } from "../utils/token-util.js";
import { validateUserLogin, validateUserRegistration } from "../validations/auth-validations.js";


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

export const loginUser = async (req, res) => {
  try {
    const { email, password, userRole = userRoles.USER.value } = req.body;

    // Validate incoming login data
    const validationErrors = validateUserLogin({ email, password, userRole });
    if (validationErrors.length > 0) {
      return sendErrorResponse(res, 400, "User validation errors", validationErrors);
    }

    // Find the user with the provided email and role
    const user = await User.findOne({ email, userRole });
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Verify password match
    const isPasswordMatch = await comparePasswords(password, user.password);
    if (!isPasswordMatch) {
      return sendErrorResponse(res, 400, "Invalid username or password");
    }

    // Generate access & refresh tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Hash refresh token before storing in DB
    const encryptedRefreshToken = await hashRefreshToken(refreshToken);
    user.refreshToken = encryptedRefreshToken;
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Prepare safe user data for response
    const userData = {
      userRole: user.userRole,
      email: user.email,
      userId: user._id,
    };

    // Send successful login response (refreshToken excluded for security)
    return sendSuccessResponse(res, 200, "User logged in successfully", {
      accessToken,
      user: userData,
    });
  } catch (error) {
    // Handle server errors
    sendErrorResponse(res, 500, "Internal Server Error", error);
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { userId } = req.user;

    // Check if the user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Extract access token from Authorization header (Bearer token)
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (accessToken) {
      await blacklistToken(accessToken); // Ensure token is revoked
    }

    // Clear stored refresh token in DB
    existingUser.refreshToken = null;
    await existingUser.save();

    // Remove refresh token from cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return sendSuccessResponse(res, 200, "Logout successful");

  } catch (error) {
    return sendErrorResponse(res, 500, "Internal Server Error", error);
  }
};

export const refreshUserTokens = async (req, res) => {
  try {
    const { refreshToken: clientRefreshToken } = req.cookies;
    
    //Check if refresh token is provided
    if (!clientRefreshToken) {
      return sendErrorResponse(res, 400, "Refresh token is required.");
    }
    
    // Verify and decode the provided refresh token
    const decodedRefreshToken = verifyEncodedToken(clientRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the user linked to the token
    const existingUser = await User.findById(decodedRefreshToken.userId);
    if (!existingUser) {
      return sendErrorResponse(res, 404, "User not found.");
    }

    // Validate that the provided refresh token matches the stored one
    const isRefreshTokenValid = await compareRefreshTokens(
      clientRefreshToken,
      existingUser.refreshToken
    );
    if (!isRefreshTokenValid) {
      return sendErrorResponse(res, 401, "Invalid refresh token.");
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(existingUser._id);
    const newRefreshToken = generateRefreshToken(existingUser._id);

    // Store hashed version of the new refresh token
    existingUser.refreshToken = await hashRefreshToken(newRefreshToken);
    await existingUser.save();

    // Set the new refresh token in a secure cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccessResponse(res, 200, "Tokens refreshed successfully", {
      accessToken: newAccessToken,
    });

  } catch (error) {
    return sendErrorResponse(res, 500, "Internal Server Error", error);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Generate a 4-digit temporary password
    const tempPassword = generateTempPassword();

    const encryptedTempPassword = await hashPassword(tempPassword);

    // Save temp password & set 24-hour expiration
    existingUser.tempPassword = encryptedTempPassword;
    existingUser.tempPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await existingUser.save();

    // Send temporary password to user's email
    await sendTempPasswordEmail(email, tempPassword);

    return sendSuccessResponse(
      res,
      200,
      "Temporary password has been sent to your email"
    );

  } catch (error) {
    return sendErrorResponse(res, 500, "Internal Server Error", error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, tempPassword, newPassword } = req.body;

    // Validate input
    if (!email || !tempPassword || !newPassword) {
      return sendErrorResponse(res, 400, "Email, temporary password, and new password are required.");
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendErrorResponse(res, 404, "User not found.");
    }

    // Check if temporary password matches
    const isTempPasswordValid = await comparePasswords(tempPassword, user.tempPassword);
    if (!isTempPasswordValid) {
      return sendErrorResponse(res, 401, "Invalid temporary password.");
    }

    // Check if temp password is expired (optional if you store expiration)
    if (user.tempPasswordExpires && user.tempPasswordExpires < Date.now()) {
      return sendErrorResponse(res, 400, "Temporary password has expired.");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear temporary password fields
    user.password = hashedPassword;
    user.tempPassword = undefined;
    user.tempPasswordExpires = undefined;
    await user.save();

    return sendSuccessResponse(res, 200, "Password reset successfully.");
  } catch (error) {
    console.error("Reset Password Error:", error);
    return sendErrorResponse(res, 500, "Server error during password reset.");
  }
};