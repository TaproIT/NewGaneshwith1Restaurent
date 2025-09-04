import Booking from "../models/Reception/booking.js";


export const findActiveBookingByRoomNo = async (roomNo) => {
    const today = new Date();

    const booking = await Booking.findOne({
        currentRooms: { $elemMatch: { roomNo, isActive: true } }, // ensure same element
        checkIn: { $lte: today },
        checkOut: { $gte: today },
        isCheckOut: false,
    }).select("_id");

    return booking ? booking._id : null;
};

