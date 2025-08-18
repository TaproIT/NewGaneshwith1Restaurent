import User from "../models/user-model.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response-util.js";

/**
 * Controller: Get all registered users
 * Fetches the complete list of users from the database.
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    // If no users found, return an empty list instead of null
    if (!users || users.length === 0) {
      return sendErrorResponse(res, 404, "No users found.");
    }

    return sendSuccessResponse(res, 200, "User list retrieved successfully.", {
      users,
    });
  } catch (error) {
    return sendErrorResponse(res, 500, "Internal Server Error", error);
  }
};


// Get the role of the currently authenticated user
export const getUserRole = async (req, res) => {
  try {
    // Extract userId from decoded token (set by authentication middleware)
    const { userId } = req.user;

    // Find the user in the database
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Retrieve the user's role
    const userRole = existingUser.userRole;

    // Send success response with the user role
    return sendSuccessResponse(res, 200, "User role retrieved successfully", {
      userRole,
    });
  } catch (error) {
    // Send generic server error response
    return sendErrorResponse(res, 500, "Internal Server Error");
  }
};
