import { getCode, getNames } from "country-list";
import validator from "validator";

// Get all country names once
const countryNames = getNames(); // ["Afghanistan", "Albania", ...]
const countryCodes = countryNames.map(name => getCode(name)); // ["AF", "AL", ...]


export const validateGuestRegistration = (data) => {
  const errors = [];

  // Guest name validation
  if (!data.guestName || validator.isEmpty(String(data.guestName))) {
    errors.push("Guest name is required");
  } else if (data.guestName.length > 100) {
    errors.push("Guest name is too long");
  }

  // Country validation
  if (!data.country || validator.isEmpty(String(data.country))) {
    errors.push("Country is required");
  } else {
    const input = String(data.country).trim();

    const isValidCountry =
      countryNames.includes(input) || // full name
      countryCodes.includes(input.toUpperCase()); // code

    if (!isValidCountry) {
      errors.push("Invalid country name or code");
    }
  }

  // Passport ID validation
  if (!data.passportID || validator.isEmpty(String(data.passportID))) {
    errors.push("Passport ID is required");
  } else if (!/^[A-Z0-9]{5,15}$/i.test(data.passportID)) {
    errors.push("Invalid passport ID (must be 5–15 alphanumeric characters)");
  }

  // Email validation
  if (!data.email || validator.isEmpty(String(data.email))) {
    errors.push("Email is required");
  } else if (!validator.isEmail(data.email)) {
    errors.push("Email is not valid");
  } else if (data.email.length > 100) {
    errors.push("Email is too long");
  }

  // WhatsApp (optional, but validate format if provided)
  if (data.whatsApp && !validator.isMobilePhone(String(data.whatsApp))) {
    errors.push("WhatsApp number is not valid");
  }

  // Number of kids validation
  if (data.numberOfKids !== undefined && (!validator.isInt(String(data.numberOfKids), { min: 0 }))) {
    errors.push("Number of kids must be 0 or a positive integer");
  }

  // Number of adults validation
  if (data.numberOfAdults === undefined || data.numberOfAdults === null) {
    errors.push("Number of adults is required");
  } else if (!validator.isInt(String(data.numberOfAdults), { min: 1 })) {
    errors.push("Number of adults must be at least 1");
  }

  // Check-in / Check-out validation
  if (!data.checkIn || !validator.isISO8601(String(data.checkIn))) {
    errors.push("Valid check-in date is required");
  }
  if (!data.checkOut || !validator.isISO8601(String(data.checkOut))) {
    errors.push("Valid check-out date is required");
  }
  if (data.checkIn && data.checkOut && new Date(data.checkOut) <= new Date(data.checkIn)) {
    errors.push("Check-out date must be after check-in date");
  }

  return errors;
};