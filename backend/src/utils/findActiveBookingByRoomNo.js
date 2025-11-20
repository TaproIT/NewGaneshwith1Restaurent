// import Booking from "../models/Reception/booking.js";
//
// const MIN = 60 * 1000;
// const DAY = 24 * 60 * MIN;
//
// /** Shift a Date by an offset (minutes) to emulate "local" time */
// const shift = (d, offsetMin) => new Date(d.getTime() + offsetMin * MIN);
//
// /** Start of *local* day as a UTC Date, using a fixed offset */
// const startOfLocalDayUTC = (d, offsetMin) => {
//     const s = shift(d, offsetMin);
//     const startLocal = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
//     return new Date(startLocal.getTime() - offsetMin * MIN);
// };
//
// /** End (start of next day) of *local* day as a UTC Date */
// const endOfLocalDayUTC = (d, offsetMin) => new Date(startOfLocalDayUTC(d, offsetMin).getTime() + DAY);
//
// export const findActiveBookingByRoomNo = async (roomNo) => {
//     const OFFSET_MIN = 5 * 60 + 30; // +05:30 for Sri Lanka
//     const now = new Date();
//     const startOfTodayUTC = startOfLocalDayUTC(now, OFFSET_MIN);
//     const startOfTomorrowUTC = endOfLocalDayUTC(now, OFFSET_MIN);
//
//     const booking = await Booking.findOne({
//         currentRooms: { $elemMatch: { roomNo: String(roomNo), isActive: true } },
//         isCheckOut: false,
//         checkIn:  { $lt: startOfTomorrowUTC },
//         checkOut: { $gte: startOfTodayUTC },
//     }).select('_id').lean();
//
//     return booking ? booking._id : null;
// };

import Booking from "../models/Reception/booking.js";

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

/** Shift a Date by an offset (minutes) to emulate "local" time */
const shift = (d, offsetMin) => new Date(d.getTime() + offsetMin * MIN);

/** Start of *local* day as a UTC Date, using a fixed offset */
const startOfLocalDayUTC = (d, offsetMin) => {
    const s = shift(d, offsetMin);
    const startLocal = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
    return new Date(startLocal.getTime() - offsetMin * MIN);
};

/** End (start of next day) of *local* day as a UTC Date */
const endOfLocalDayUTC = (d, offsetMin) => new Date(startOfLocalDayUTC(d, offsetMin).getTime() + DAY);

export const findActiveBookingByRoomNo = async (roomNo) => {
    const OFFSET_MIN = 5 * 60 + 30; // +05:30 for Sri Lanka
    const now = new Date();
    const startOfTodayUTC = startOfLocalDayUTC(now, OFFSET_MIN);
    const startOfTomorrowUTC = endOfLocalDayUTC(now, OFFSET_MIN);

    const booking = await Booking.findOne({
        currentRooms: { $elemMatch: { roomNo: String(roomNo), isActive: true } },
        // isCheckOut removed
        checkIn:  { $lt: startOfTomorrowUTC },
        checkOut: { $gte: startOfTodayUTC },
    })
        .select('_id')
        .lean();

    return booking ? booking._id : null;
};
