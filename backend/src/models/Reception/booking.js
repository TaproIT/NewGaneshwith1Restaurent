import mongoose from "mongoose";
import Counter from "./counter.model.js";

const PAYMENT_METHOD_VALUES = ["Cash", "Card", "Free-Bill"];

export const PaymentMethods = Object.freeze({
    CASH: { value: "Cash", label: "Cash" },
    CARD: { value: "Card", label: "Card" },
    FREE_BILL: { value: "Free-Bill", label: "Free Bill" },
});

const updateHistorySchema = new mongoose.Schema(
    {
        updateUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedByName: { type: String, required: true },
        updateDate: { type: Date, required: true },
    },
    { _id: false }
);


const CUSTOMER_VALUES = ["Booking.com", "Open Booking"];
const BREAKFAST_VALUES = ["Included", "Not-Included", "Full Board"];

const additionalPriceItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 }, // stored in normal units (e.g., LKR)
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        hotel: {
            type: String,
            required: true,
            enum: ['Ganesh Garden Beach Cabana', 'Marakolliya Beach Resort'],
            set: v => v.trim(),
        },
        guestName: { type: String, required: true },
        uniqueBookingId: { type: String, required: true, unique: true },
        country: { type: String},
        email: { type: String },
        whatsapp: { type: String },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdByName: { type: String },
        checkOutById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        checkOutByName: { type: String },
        passportId: { type: String },
        totalGuests: { type: Number },
        kids: { type: Number },
        adults: { type: Number},
        lengthOfStay: { type: Number, required: true },
        oldLengthOfStay: { type: Number, required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        // Current Room(s) for the booking.
        currentRooms: [{
            roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
            roomNo: { type: String, required: true },
            price: { type: Number },
            currency: {
                type: String,
                enum: ["LKR", "USD", "EUR"],
                default: "LKR"
            },
            isActive: { type: Boolean, default: true },
        }],

        // History of rooms switched.
        roomsHistory: [
            {
                roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
                roomNo: { type: String, required: true },
                perDayPrice: { type: Number, required: true },

                currency: {
                    type: String,
                    enum: ["LKR", "USD", "EUR"],
                    default: "LKR"
                },
                night: { type: Number},

                finalRoomTotalPrice: { type: Number },
                discountPrice: { type: Number },

                switchOutDate: { type: Date, required: true, default: null },
                switchInDate: { type: Date, required: true},
                isSwitched: { type: Boolean, default: false },
                switchFrom: { type: String },
                perDayPriceHistory: [
                    {
                        price: { type: Number, required: true },
                        currency: {
                            type: String,
                            enum: ["LKR", "USD", "EUR"],
                            default: "LKR"
                        },
                        date: { type: Date, required: true, default: Date.now }
                    }
                ],
                status: {
                    type: String,
                    enum: ["active", "switched_out", "switched_in", "completed", "no status"],
                    default: "no status"
                } 
            },
        ],

        // Total bill for the booking.
        finalAllRoomsTotalPrice: { type: Number },
        totalOrdersBill:{type: Number },

        // Frontend sends array; we store both detail & computed total
        additionalPriceItems: [additionalPriceItemSchema],
        totalAdditionalPrice: { type: Number, default: 0 },

        // Bill breakdown
        subtotal: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        serviceCharge: { type: Number, default: 0 },
        miniBar:{ type: Number, default: 0 },
        laundary: { type: Number, default: 0 },
        spa: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },

        // Master total for the booking
        totalBill: { type: Number, default: 0 },

        // Payment method (from enum)
        paymentMethod: {
            type: String,
            enum: PAYMENT_METHOD_VALUES,
        },

        customerType: {
            type: String,
            enum: CUSTOMER_VALUES,
            required: true,
        },

        breakfast: {
            type: String,
            enum: BREAKFAST_VALUES,
            required: true,
        },

        // logger
        updatesHistory: [updateHistorySchema],

        //QR Code
        payload: { type: Object },
        qrPublicId: { type: String, required: true },
        qrUrl: { type: String, required: true },

        // Additional verification
        bookingDate: { type: Date, required: true },
        isCheckOut: { type: Boolean, required: true },
        oldCheckOutDate: { type: Date },
        // CRON JOB
        oldCheckOutDateStatus:{ type: Boolean, default: false },
        lastExtendedOn: { type: Date }, // set to start-of-day when extension happens
        orders: [
            {
              oderId:{
                 type: mongoose.Schema.Types.ObjectId,
                 ref: "Order",
              },
              date: {type: Date}  
            }
        ]
    },
    { timestamps: true }
);

// Add these indexes to speed up the nightly job & frontend query:
bookingSchema.index({ isCheckOut: 1, checkOut: 1 });
bookingSchema.index({ lastExtendedOn: 1, isCheckOut: 1 });

bookingSchema.pre("validate", async function (next) {
    if (this.uniqueBookingId) return next();

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}${month}${day}`;

    try {
        const counter = await Counter.findOneAndUpdate(
            { dateKey },
            { $inc: { sequenceValue: 1 } },
            { new: true, upsert: true }
        );

        const paddedSeq = String(counter.sequenceValue).padStart(4, "0");
        this.uniqueBookingId = `booking${dateKey}${paddedSeq}`;

        next();
    } catch (err) {
        next(err);
    }
});

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;

