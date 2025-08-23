import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        hotel: { type: String, required: true },
        guestName: { type: String, required: true },
        country: { type: String, required: true },
        email: { type: String },
        whatsapp: { type: String },
        passportId: { type: String },
        totalGuests: { type: Number, required: true },
        kids: { type: Number, required: true },
        adults: { type: Number, required: true },
        lengthOfStay: { type: Number, required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },

        // Current Room(s) for the booking.
        currentRooms: [{
            roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
            roomNo: { type: String, required: true },
            isActive: { type: Boolean, default: true },
        }],

        // History of rooms switched.
        roomsHistory: [
            {
                roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
                roomNo: { type: String, required: true },
                perDayPrice: { type: Number, required: true },

                finalRoomTotalPrice: { type: Number },
                discountPrice: { type: Number },

                switchOutDate: { type: Date, required: true, default: null },
                switchInDate: { type: Date, required: true},
                isSwitched: { type: Boolean, default: false },
                switchFrom: { type: String },
                status: {
                    type: String,
                    enum: ["active", "switched_out", "switched_in", "completed", "no status"],
                    default: "no status"
                }
            },
        ],

        // Total bill for the booking.
        finalAllRoomsTotalPrice: { type: Number },
        totalBill: { type: Number },

        //QR Code
        payload: { type: Object },
        qrPublicId: { type: String, required: true },
        qrUrl: { type: String, required: true },

        // Additional verification
        bookingDate: { type: Date, required: true },
        isCheckOut: { type: Boolean, required: true },
        realCheckOutDate: { type: Date },
    },
    { timestamps: true }
);


const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
