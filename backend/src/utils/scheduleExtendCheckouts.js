// cron/extendCheckout.js
import cron from "node-cron";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import Booking from "../models/Reception/booking.js";


dayjs.extend(utc);
dayjs.extend(timezone);

const HOTEL_TZ = "Asia/Colombo";

export const scheduleExtendCheckoutCron = () => {

    cron.schedule("5 0 * * *", async () => {
        try {
            const startOfToday = dayjs().tz(HOTEL_TZ).startOf("day");
            const startOfTomorrow = startOfToday.add(1, "day");

            // 1) Find bookings that should be extended today:
            //    - Not checked out
            //    - checkOut falls on today (>= startOfToday and < startOfTomorrow)
            //    - Not already extended today (lastExtendedOn < startOfToday or not set)

            const candidates = await Booking.find({
                isCheckOut: false,
                checkOut: { $gte: startOfToday.toDate(), $lt: startOfTomorrow.toDate() },
                $or: [
                    { lastExtendedOn: { $exists: false } },
                    { lastExtendedOn: { $lt: startOfToday.toDate() } },
                ],
            }).select("_id checkOut oldCheckOutDateStatus currentRooms");

            if (!candidates.length) {
                console.log("[CRON] No bookings to extend today.");
                return;
            }

            // 2) Build bulk updates
            const ops = candidates.map((b) => {
                const setFields = {
                    checkOut: dayjs(b.checkOut).add(1, "day").toDate(),
                    lastExtendedOn: startOfToday.toDate(),
                };

                if (!b.oldCheckOutDateStatus) {
                    setFields.oldCheckOutDate = b.checkOut;
                    setFields.oldCheckOutDateStatus = true;
                }

                return {
                    updateOne: {
                        filter: { _id: b._id },
                        update: { $set: setFields },
                    },
                };
            });

            const result = await Booking.bulkWrite(ops);
            console.log(`[CRON] Extended ${result.modifiedCount} bookings.`);
        } catch (err) {
            console.error("[CRON] extendCheckout error:", err);
        }
    }, {
        timezone: HOTEL_TZ,
    });
};
