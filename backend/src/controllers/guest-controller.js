import Guest from "../models/guest-model.js";
import { validateGuestRegistration } from "../validations/guest-validations.js";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response-util.js";

export const registerNewGuest = async (req, res) => {
  try {
    const {
      guestName,
      country,
      passportID,
      email,
      whatsApp,
      numberOfKids,
      numberOfAdults,
      checkIn,
      checkOut
    } = req.body;

    // Validate input data
    const validationErrors = validateGuestRegistration(req.body);
    if (validationErrors.length > 0) {
      return sendErrorResponse(res, 400, "Validation errors", validationErrors);
    }

    // Check if guest already exists by passport or email
    const existingGuest = await Guest.findOne({
      $or: [{ passportID }, { email }]
    });
    if (existingGuest) {
      return sendErrorResponse(res, 400, "A guest with this passport ID or email already exists");
    }

    // Create new guest record
    const newGuest = await Guest.create({
      guestName,
      country,
      passportID,
      email,
      whatsApp,
      numberOfKids,
      numberOfAdults,
      checkIn,
      checkOut
    });

    // Prepare guest data for response
    const guestData = {
      id: newGuest._id,
      guestName: newGuest.guestName,
      country: newGuest.country,
      passportID: newGuest.passportID,
      email: newGuest.email,
      whatsApp: newGuest.whatsApp,
      numberOfKids: newGuest.numberOfKids,
      numberOfAdults: newGuest.numberOfAdults,
      checkIn: newGuest.checkIn,
      checkOut: newGuest.checkOut,
    };

    // Send success response
    return sendSuccessResponse(res, 201, "Guest registered successfully", guestData);

  } catch (error) {
    sendErrorResponse(res, 500, "Internal Server Error", error);
  }
};
