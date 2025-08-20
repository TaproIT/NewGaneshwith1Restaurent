import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        hotel: { type: String, required: true },

        guestName: { type: String, required: true },
        country: { type: String, required: true },
        email: { type: String },
        whatsapp: { type: String },
        passportId: { type: String, required: true },

        totalGuests: { type: Number, required: true },
        kids: { type: Number, required: true },
        Adults: { type: Number, required: true },

        lengthOfStay: { type: Number, required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },

        rooms: [
            {
                roomDetails: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Room",
                        required: true,
                    },
                ],
                perDayPrice: { type: Number, required: true },

                // Separate order references for beverages and pool/restaurant
                ordersBeverage: { type: mongoose.Schema.Types.ObjectId, ref: "BeverageOrder" },
                ordersPoolAndRestaurant: { type: mongoose.Schema.Types.ObjectId, ref: "PoolAndRestaurantOrder" },

                // Room totals
                roomTotalPrice: { type: Number },
                beverageOrderTotalPrice: { type: Number },
                poolAndRestaurantOrderTotalPrice: { type: Number },

                // Combined total price
                finalTotalPrice: { type: Number },
            },
        ],

        // Total bill for the booking (can sum all room totals and extras)
        finalAllRoomsTotalPrice: { type: Number, required: true },
        totalBill: { type: Number, required: true },

        // Payload for additional data (can be used for custom logic)
        payload: { type: Object, required: true },

        // QR code related information
        qrPublicId: { type: String, required: true },
        qrUrl: { type: String, required: true },

        // Booking timestamps
        bookingDate: { type: Date, required: true },
        IsCheckOut: { type: Boolean, required: true },
        RealCheckOutDate: { type: Date, required: true },
    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;