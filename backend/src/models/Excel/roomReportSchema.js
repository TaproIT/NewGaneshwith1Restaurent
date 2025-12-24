import mongoose from "mongoose";

const roomReportSchema = new mongoose.Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        hotel: String,
        guestName: String,
        roomNo: String,
        checkIn: Date,
        checkOut: Date,
        perDayPrice: Number,
        currencyRate: Number,
        currencyType: String,
        nights: Number,
        totalRoomPrice: Number,
        totalGuests: Number,
        breakfast: String,
        bookingCommission: Number,
        totalBreakfastPrice: Number,
        grossTotal: Number,
        serviceCharge: Number,
        netIncome: Number,
        createdAt: { type: Date, default: Date.now }
    }
);

export default mongoose.model("RoomReport", roomReportSchema);
