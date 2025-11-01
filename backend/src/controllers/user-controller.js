import User from "../models/user/user-model.js";
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


export const getUserById = async (req, res) => {
  try {
    const id = req.user.userId

    // Find user by ID
    const user = await User.findById(id);

    // If user not found
    if (!user) {
      return sendErrorResponse(res, 404, "User not found.");
    }

    // Return success response
    return sendSuccessResponse(res, 200, "User retrieved successfully.", { user });
  } catch (error) {
    // Handle invalid ObjectId error or other errors
    if (error.name === "CastError") {
      return sendErrorResponse(res, 400, "Invalid user ID format.");
    }

    return sendErrorResponse(res, 500, "Internal Server Error", error);
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found.");
    }

    // If already inactive
    if (!user.isActive) {
      return sendErrorResponse(res, 400, "User is already inactive.");
    }

    // Mark user as inactive
    user.isActive = false;
    await user.save();

    return sendSuccessResponse(res, 200, "User deactivated successfully.", {
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendErrorResponse(res, 400, "Invalid user ID format.");
    }

    return sendErrorResponse(res, 500, "Internal Server Error", error);
  }
};

export const activateUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return sendErrorResponse(res, 404, "User not found.");
    }

    if (user.isActive) {
      return sendErrorResponse(res, 400, "User is already active.");
    }

    user.isActive = true;
    await user.save();

    return sendSuccessResponse(res, 200, "User reactivated successfully.", {
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendErrorResponse(res, 400, "Invalid user ID format.");
    }

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
