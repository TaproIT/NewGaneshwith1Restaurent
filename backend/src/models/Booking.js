// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
                guestName:   { type: String, required: true },
                country:     { type: String, required: true },
                passportId:  { type: String, required: true },
                totalGuests: { type: Number, required: true },
                lengthOfStay:{ type: Number, required: true },
                checkIn:     { type: Date,   required: true },
                checkOut:    { type: Date,   required: true },
                totalUnits:  { type: Number, required: true },
                perDayPrice: { type: Number, required: true },
                whatsapp:    { type: String },
                hotel:       { type: String, required: true },
                email:       { type: String },
                rooms: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Room",
                        required: true,
                    },
                ],
                totalPrice:  { type: Number, required: true },
                payload:     { type: Object, required: true },
                qrPublicId:  { type: String, required: true },
                qrUrl:       { type: String, required: true },
                bookingDate: { type: Date,   required: true },
    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
