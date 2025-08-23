import Booking from "../models/Reception/Booking.js";


export const findActiveBookingByRoomNo = async (roomNo) => {
    const today = new Date();
    const booking = await Booking.findOne({
        "currentRooms.roomNo": roomNo,
        "currentRooms.isActive": true,
        checkIn: { $lte: today },
        checkOut: { $gte: today },
    }).select("_id");

    return booking ? booking._id : null;
};
