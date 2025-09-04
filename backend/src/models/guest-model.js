import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    passportID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    whatsApp: {
      type: String,
      trim: true,
    },
    numberOfKids: {
      type: Number,
      default: 0,
      min: 0,
    },
    numberOfAdults: {
      type: Number,
      default: 1,
      min: 1,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Guest = mongoose.model("Guest", guestSchema);

export default Guest;
