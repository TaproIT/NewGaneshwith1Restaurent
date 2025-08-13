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