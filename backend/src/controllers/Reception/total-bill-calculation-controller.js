
import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import Booking, {PaymentMethods} from "../../models/Reception/booking.js";
import Order from "../../models/order/order-model.js";
import Room from "../../models/Room.js";
import User from "../../models/user/user-model.js";
import CurrencyValue from "../../models/currency-value.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Colombo";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Start‑of‑day in Asia/Colombo
function sodTZ(d) {
    if (!d) return null;
    return dayjs(d).tz(TZ).startOf("day");
}

// Clamp a date to "today (Colombo)" if future; returns Day.js
function clampToTodayTZ(d, todaySOD) {
    if (!d) return null;
    const t = sodTZ(d);
    return t.isAfter(todaySOD) ? todaySOD : t;
}

// Hotel‑night diff, min 1 night, expects Day.js SOD inputs
function diffNightsTZ(startDayjs, endDayjs) {
    if (!startDayjs || !endDayjs) return 0;
    const s = startDayjs.valueOf();
    const e = endDayjs.valueOf();
    const raw = Math.ceil((e - s) / MS_PER_DAY);
    return Math.max(raw, 1);
}

export const getBookingBillingSummary = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid booking id" });
        }

        // 1) Load booking
        const booking = await Booking.findById(id).lean();
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // 🔄 Load latest currency conversion rates
        const cv = await CurrencyValue.findOne().sort({ effectiveAt: -1 }).lean();
        if (!cv) {
            return res.status(500).json({ message: "Currency conversion rates not found" });
        }
        // Example: cv.usd = 325 (i.e., 1 USD = 325 LKR); cv.eur = 360 (1 EUR = 360 LKR)

        const todaySOD = dayjs().tz(TZ).startOf("day");

        const rawCheckOut = booking.checkOut ? dayjs(booking.checkOut) : null;

        const checkOutIsFuture = booking.checkOut ? sodTZ(booking.checkOut).isAfter(todaySOD) : false;
        const anySwitchOutFuture = Array.isArray(booking.roomsHistory)
            ? booking.roomsHistory.some(rh => rh.switchOutDate && sodTZ(rh.switchOutDate).isAfter(todaySOD))
            : false;
        const requiresCutoff = checkOutIsFuture || anySwitchOutFuture;

        // const effectiveCheckOut = booking.checkOut
        //     ? (requiresCutoff ? todaySOD : clampToTodayTZ(booking.checkOut, todaySOD))
        //     : null;
        let effectiveCheckOut = null;

        if (booking.checkOut) {
            const co = sodTZ(booking.checkOut);

            // If switchOut or checkout is future → force today
            if (requiresCutoff) {
                effectiveCheckOut = todaySOD;
            }
            // If checkout is PAST → also force today
            else if (co.isBefore(todaySOD)) {
                effectiveCheckOut = todaySOD;
            }
            // Otherwise normal clamping (future safe)
            else {
                effectiveCheckOut = clampToTodayTZ(booking.checkOut, todaySOD);
            }
        }


        const effectiveCheckIn = booking.checkIn ? dayjs(booking.checkIn).tz(TZ) : null;

        const orderIds = (booking.orders || []).map(o => o?.oderId).filter(Boolean);
        const orders = orderIds.length
            ? await Order.find({ _id: { $in: orderIds } }).lean()
            : [];

        const orderDetails = orders.map(o => ({
            orderId: String(o._id),
            orderNumber: o.orderNumber,
            subTotal: o.subTotal ?? 0,
            tax: o.tax ?? 0,
            discount: o.discount ?? 0,
            serviceCharge: o.serviceCharge ?? 0,
            totalBill: o.totalBill ?? 0,
            paymentMethod: o.paymentMethod ?? null,
            serviceType: o.serviceType ?? null,
            restaurantType: o.restaurantType ?? null,
            customerType: o.customerType ?? null,
            orderStatus: o.orderStatus ?? null,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt
        }));

        const ordersTotalBill = orderDetails.reduce((sum, o) => sum + (Number(o.totalBill) || 0), 0);

        const roomsHistory = Array.isArray(booking.roomsHistory) ? booking.roomsHistory : [];

        const computedRoomDetails = roomsHistory.map((rh) => {
            const rawSwitchOut = rh.switchOutDate ? dayjs(rh.switchOutDate) : null;

            const effIn = rh.switchInDate ? clampToTodayTZ(rh.switchInDate, todaySOD) : null;

            // let effOut;
            // if (requiresCutoff) {
            //     effOut = todaySOD;
            // } else {
            //     const rawOut = rh.switchOutDate ? rh.switchOutDate : (effectiveCheckOut ? effectiveCheckOut.toDate() : null);
            //     effOut = rawOut ? clampToTodayTZ(rawOut, todaySOD) : null;
            // }

            // ------------------ FIXED SWITCH OUT LOGIC --------------------
                    const sameRoomCount = roomsHistory.filter(r => r.roomNo === rh.roomNo).length;
                    const today = todaySOD; // already Sri Lanka timezone

                    let effOut;

                    // Case 1: More than one record for same room → check isSwitched
                    if (sameRoomCount > 1) {
                        if (rh.isSwitched === false) {
                            // If not switched → switchOutDate must be today
                            effOut = today;
                        } else {
                            // If switched → keep existing switchOutDate
                            effOut = rh.switchOutDate ? sodTZ(rh.switchOutDate) : today;
                        }
                    }

                    // Case 2: Only one record exists for this roomNo
                    else {
                        const isActiveNow = booking.currentRooms?.some(r => r.roomNo === rh.roomNo);

                        if (isActiveNow) {
                            // Active → switchOutDate must be today
                            effOut = today;
                        } else {
                            // Inactive → keep existing (if exists), else today
                            effOut = rh.switchOutDate ? sodTZ(rh.switchOutDate) : today;
                        }
                    }
                    // --------------------------------------------------------------


            // let effOut;

            // if (rh.switchOutDate) {
            //     const sw = sodTZ(rh.switchOutDate);

            //     // SwitchOut is future → force today
            //     if (sw.isAfter(todaySOD)) {
            //         effOut = todaySOD;
            //     }
            //     // SwitchOut is past → also force today
            //     else if (sw.isBefore(todaySOD)) {
            //         effOut = todaySOD;
            //     }
            //     // SwitchOut is today → keep as-is
            //     else {
            //         effOut = sw;
            //     }
            // } else {
            //     // If there's no switchOut → fall back to effectiveCheckOut logic
            //     const rawOut = effectiveCheckOut ? effectiveCheckOut : null;
            //     effOut = rawOut ? rawOut : null;
            // }


            const perDayPrice = Number(rh.perDayPrice) || 0;
            const currency = rh.currency || "LKR"; // 💱 determine currency of this price
            let perDayPriceInLKR = perDayPrice;

            //  Currency conversion if not LKR
            if (currency === "USD") {
                perDayPriceInLKR = perDayPrice * (cv.usd);
            } else if (currency === "EUR") {
                perDayPriceInLKR = perDayPrice * (cv.eur);
            }
            // else if currency is LKR, no change

            const nights = diffNightsTZ(effIn, effOut);
            let finalRoomTotalPrice = nights * perDayPriceInLKR; // 💰 use converted price for total

            //  Apply discount if available
            let discountPrice = Number(rh.discountPrice) || 0;

            if (discountPrice > 0) {
                if (currency === "USD") {
                    discountPrice = discountPrice * (cv.usd);
                } else if (currency === "EUR") {
                    discountPrice = discountPrice * (cv.eur);
                }
                finalRoomTotalPrice = Math.max(finalRoomTotalPrice - discountPrice, 0); // avoid negatives
            }

            return {
                _id: rh._id ? String(rh._id) : null,
                roomId: rh.roomId ? String(rh.roomId) : null,
                roomNo: rh.roomNo,
                perDayPrice: perDayPrice,
                currency, // record original currency
                perDayPriceInLKR, // 💰 show converted per day
                effIn,
                effOut,
                rawSwitchOut,
                nights,
                finalRoomTotalPrice,
                status: rh.status ?? "no status",
                isSwitched: !!rh.isSwitched,
                switchFrom: rh.switchFrom ?? null
            };
        });

        const totalRoomsCharges = computedRoomDetails.reduce((sum, r) => sum + (Number(r.finalRoomTotalPrice) || 0), 0);
        const totalroomcount = roomsHistory.length;

        const finalAllRoomsTotalPrice = totalRoomsCharges;
        const totalOrdersBill = ordersTotalBill;
        const totalBill = Number(finalAllRoomsTotalPrice) + Number(totalOrdersBill);

        const bookingDoc = await Booking.findById(id);
        if (!bookingDoc) {
            return res.status(404).json({ message: "Booking not found (while saving)" });
        }

        bookingDoc.roomsHistory = bookingDoc.roomsHistory.map((rh) => {
            const match = computedRoomDetails.find(crd => {
                if (rh._id && crd._id && String(rh._id) === String(crd._id)) return true;
                return String(rh.roomId || "") === String(crd.roomId || "") &&
                    rh.roomNo === crd.roomNo &&
                    Number(rh.perDayPrice) === Number(crd.perDayPrice);
            });

            if (match) {
                rh.finalRoomTotalPrice = match.finalRoomTotalPrice; // 💰 persist converted total
                rh.night = match.nights;

                if (rh.currency === "USD") {
                    rh.currencyRate = cv.usd;
                } else if (rh.currency === "EUR") {
                    rh.currencyRate = cv.eur;
                } else {
                    rh.currencyRate = 1; // LKR
                }
            } else {
                const effIn = rh.switchInDate ? clampToTodayTZ(rh.switchInDate, todaySOD) : null;
                const rawOut = rh.switchOutDate ? rh.switchOutDate : (effectiveCheckOut ? effectiveCheckOut.toDate() : null);
                const effOut = rawOut ? clampToTodayTZ(rawOut, todaySOD) : null;
                const nights = diffNightsTZ(effIn, effOut);
                rh.finalRoomTotalPrice = (Number(rh.perDayPrice) || 0) * nights; // Note: if original currency non‑LKR, this fallback might not convert
                rh.night = nights;

                if (rh.currency === "USD") {
                    rh.currencyRate = cv.usd;
                } else if (rh.currency === "EUR") {
                    rh.currencyRate = cv.eur;
                } else {
                    rh.currencyRate = 1;
                }
            }
            return rh;
        });

        bookingDoc.finalAllRoomsTotalPrice = finalAllRoomsTotalPrice;
        bookingDoc.totalOrdersBill = totalOrdersBill;
        bookingDoc.totalBill = totalBill;


        await bookingDoc.save();

        const roomDetailsForResponse = computedRoomDetails.map(r => ({
            roomId: r.roomId,
            roomNo: r.roomNo,
            perDayPrice: r.perDayPrice,
            currency: r.currency,
            perDayPriceInLKR: r.perDayPriceInLKR, // for response
            switchInDate: r.effIn ? r.effIn.format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
            switchOutDate: r.effOut ? r.effOut.format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
            switchInDateLocal: r.effIn ? r.effIn.format("YYYY-MM-DD") : null,
            switchOutDateLocal: r.effOut ? r.effOut.format("YYYY-MM-DD") : null,
            rawSwitchOutDate: r.rawSwitchOut ? r.rawSwitchOut.toISOString() : null,
            rawSwitchOutDateLocal: r.rawSwitchOut ? r.rawSwitchOut.tz(TZ).format("YYYY-MM-DD") : null,
            nights: r.nights,
            finalRoomTotalPrice: r.finalRoomTotalPrice,
            status: r.status,
            isSwitched: r.isSwitched,
            switchFrom: r.switchFrom
        }));

        return res.status(200).json({
            bookingId: String(bookingDoc._id),
            hotel: booking.hotel,
            breakfast: booking.breakfast,
            customerType: booking.customerType,
            guestName: booking.guestName,
            checkIn: effectiveCheckIn ? effectiveCheckIn.format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
            checkOut: effectiveCheckOut ? effectiveCheckOut.format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
            checkInDateLocal: effectiveCheckIn ? effectiveCheckIn.format("YYYY-MM-DD") : null,
            checkOutDateLocal: effectiveCheckOut ? effectiveCheckOut.format("YYYY-MM-DD") : null,
            rawCheckOut: rawCheckOut ? rawCheckOut.toISOString() : null,
            rawCheckOutLocal: rawCheckOut ? rawCheckOut.tz(TZ).format("YYYY-MM-DD") : null,
            orderDetails,
            ordersTotalBill: totalOrdersBill,
            roomDetails: roomDetailsForResponse,
            totalRoomsCharges,
            totalroomcount,
            finalAllRoomsTotalPrice,
            totalOrdersBill,
            totalBill,
            futureDateCutoffApplied: requiresCutoff,
            updatedAt: bookingDoc.updatedAt
        });
    } catch (err) {
        console.error("getBookingBillingSummary error:", err);
        return res.status(500).json({ message: "Server error", error: err?.message || err });
    }
};


// Convert normal currency units to integer cents for precise comparison
function toCents(n) {
    return Math.round(Number(n || 0) * 100);
}

// Normalize an array of additional prices (guard against bad payloads)
function normalizeAdditionalItems(items = []) {
    if (!Array.isArray(items)) return [];
    return items
        .filter(Boolean)
        .map((x) => ({
            name: String(x?.name || "").trim(),
            price: Number(x?.price || 0),
        }))
        .filter((x) => x.name && x.price >= 0);
}

// Accept 0–1 or 0–100 and normalize to 0–1
function normalizeDiscountRate(discount) {
    const d = Number(discount);
    if (!Number.isFinite(d) || d < 0) return null;
    if (d <= 1) return d;           // already a rate (e.g., 0.15)
    if (d <= 100) return d / 100;   // percentage (e.g., 15)
    return null;
}

export const finalizeBookingBill = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid booking id" });
        }

        const {
            originalBillTotal,
            totalRoomCharge,
            totalOrdersPrice,
            additionalPrice = [],
            subtotal,
            tax,
            discount,
            totalBill,
            paymentMethod,
            miniBar,
            laundary,
            spa,
        } = req.body || {};

        const checkOutById = req.user?.userId || req.user?._id;
        const laundaryValue = laundary ? Number(laundary) : 0;
        const spaValue = spa ? Number(spa) : 0;
        const miniBarValue = miniBar ? Number(miniBar) : 0;

        const serviceCharge = 0;

        if (!checkOutById) {
            return res.status(400).json({ error: "Unauthorized checkOut. ID is required." });
        }



        const user = await User.findById(checkOutById).lean();
        if (!user) {
            return res.status(404).json({ error: "User not found. Invalid createdById." });
        }

        const  checkOutByName = user.name;
        // Basic presence checks
        if (originalBillTotal == null) {
            return res.status(400).json({ message: "originalBillTotal is required" });
        }
        if (totalRoomCharge == null) {
            return res.status(400).json({ message: "totalRoomCharge is required" });
        }
        if (totalOrdersPrice == null) {
            return res.status(400).json({ message: "totalOrdersPrice is required" });
        }
        if (subtotal == null) {
            return res.status(400).json({ message: "subtotal is required" });
        }
        if (tax == null) {
            return res.status(400).json({ message: "tax is required" });
        }
        // if (serviceCharge == null) {
        //     return res.status(400).json({ message: "serviceCharge is required" });
        // }
        if (discount == null) {
            return res.status(400).json({ message: "discount is required" });
        }
        if (totalBill == null) {
            return res.status(400).json({ message: "totalBill is required" });
        }
        if (!paymentMethod) {
            return res.status(400).json({ message: "paymentMethod is required" });
        }
        if (!Object.values(PaymentMethods).map((p) => p.value).includes(paymentMethod)) {
            return res.status(400).json({
                message: `Invalid paymentMethod. Allowed: ${Object.values(PaymentMethods)
                    .map((p) => p.value)
                    .join(", ")}`,
            });
        }

        // Normalize discount to 0–1
        // const discountRate = normalizeDiscountRate(discount);
        // if (discountRate == null || discountRate < 0 || discountRate > 1) {
        //     return res.status(400).json({
        //         message:
        //             "Invalid discount. Provide a percentage as 0–1 (e.g., 0.15) or 0–100 (e.g., 15).",
        //         details: { received: discount },
        //     });
        // }

        if (discount < 0) {
            return res.status(400).json({
                message: "Invalid discount. Discount must be a positive price value.",
                details: { received: discount },
            });
        }

        if (laundaryValue < 0) {
            return res.status(400).json({
                message: "Invalid laundary. laundary must be a positive price value.",
                details: { received:laundary },
            });
        }

        if (spaValue < 0) {
            return res.status(400).json({
                message: "Invalid Spa. Spa must be a positive price value.",
                details: { received: spa },
            });
        }
        if (miniBarValue < 0) {
            return res.status(400).json({
                message: "Invalid mini bar. Mini bar must be a positive price value.",
                details: { received: miniBar },
            });
        }

        // Start transaction
        session.startTransaction();

        // Load booking
        const booking = await Booking.findById(id).session(session);
        if (!booking) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.isCheckOut) {
            await session.abortTransaction();
            return res.status(409).json({
                message: `Guest name is ${booking.guestName}. Already checked out at ${booking.checkOut}`,
            });
        }

        // Normalize all comparisons to the same timezone @ start-of-day
        const todaySOD = dayjs().tz(TZ).startOf("day");
        const checkInSOD = dayjs(booking.checkIn).tz(TZ).startOf("day");
        const checkOutSOD = dayjs(booking.checkOut).tz(TZ).startOf("day");

        // Valid if check-in is today or earlier (local)
        const isCheckInValid = checkInSOD.isSame(todaySOD) || checkInSOD.isBefore(todaySOD);

        // Valid if check-out is today or later (local)
        const isCheckOutValid = checkOutSOD.isSame(todaySOD) || checkOutSOD.isAfter(todaySOD);

        if (!isCheckInValid) {
            await session.abortTransaction();
            return res.status(400).json({
                message:
                    "Invalid check-in date. It must be today or a past date relative to the current local date.",
                details: {
                    checkInUTC: booking.checkIn,
                    todayUTC: todaySOD.toDate().toISOString(),
                    checkInLocal: checkInSOD.format("YYYY-MM-DD HH:mm z"),
                    todayLocal: todaySOD.format("YYYY-MM-DD HH:mm z"),
                    timezone: TZ,
                },
            });
        }

        // if (!isCheckOutValid) {
        //     await session.abortTransaction();
        //     return res.status(400).json({
        //         message:
        //             "Invalid check-out date. It must be today or a future date relative to the current local date.",
        //         details: {
        //             checkOutUTC: booking.checkOut,
        //             todayUTC: todaySOD.toDate().toISOString(),
        //             checkOutLocal: checkOutSOD.format("YYYY-MM-DD HH:mm z"),
        //             todayLocal: todaySOD.format("YYYY-MM-DD HH:mm z"),
        //             timezone: TZ,
        //         },
        //     });
        // }

        // 1) Check originalBillTotal equals booking.totalBill
        const matchOriginalTotal =
            toCents(originalBillTotal) === toCents(booking.totalBill || 0);

        if (!matchOriginalTotal) {
            await session.abortTransaction();
            return res.status(400).json({
                message:
                    "Mismatch: originalBillTotal does not match the current totalBill in the database.",
                details: {
                    sent: Number(originalBillTotal),
                    db: Number(booking.totalBill || 0),
                },
            });
        }

        // 2) Validate total room charge & orders
        const dbRoom = Number(booking.finalAllRoomsTotalPrice || 0);
        const dbOrders = Number(booking.totalOrdersBill || 0);

        if (toCents(totalRoomCharge) !== toCents(dbRoom)) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Mismatch: totalRoomCharge does not match the database value.",
                details: { sent: Number(totalRoomCharge), db: dbRoom },
            });
        }

        if (toCents(totalOrdersPrice) !== toCents(dbOrders)) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Mismatch: totalOrdersPrice does not match the database value.",
                details: { sent: Number(totalOrdersPrice), db: dbOrders },
            });
        }

        // 3) Handle additional prices (sum and store)
        const cleanedAdditional = normalizeAdditionalItems(additionalPrice);
        const computedAdditionalTotal = cleanedAdditional.reduce(
            (acc, x) => acc + Number(x.price || 0),
            0
        );

        // 4) Calculate subtotal = totalAdditionalPrice + totalRoomCharge + totalOrdersPrice
        const computedSubtotal =
            Number(computedAdditionalTotal) +
            Number(totalRoomCharge) +
            Number(totalOrdersPrice);

        if (toCents(subtotal) !== toCents(computedSubtotal)) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Mismatch: subtotal is incorrect.",
                details: {
                    sent: Number(subtotal),
                    expected: Number(computedSubtotal),
                    breakdown: {
                        totalAdditionalPrice: Number(computedAdditionalTotal),
                        totalRoomCharge: Number(totalRoomCharge),
                        totalOrdersPrice: Number(totalOrdersPrice),
                    },
                },
            });
        }

        // 5) Validate totalBill = subtotal + tax + serviceCharge - (subtotal * discountRate)
        // const discountAmount = Number(subtotal) * discountRate;
        const discountAmount = Number(discount);
        const computedTotalBill =
            Number(subtotal) + Number(miniBarValue) + Number(laundaryValue) + Number(spaValue) + Number(tax) + Number(serviceCharge) - discountAmount;

        if (toCents(totalBill) !== toCents(computedTotalBill)) {
            await session.abortTransaction();
            return res.status(400).json({
                message:
                    "Mismatch: totalBill must equal subtotal + tax + mini bar + laundary + spa + serviceCharge - discountPrice.",
                details: {
                    sent: Number(totalBill),
                    expected: Number(computedTotalBill),
                    breakdown: {
                        subtotal: Number(subtotal),
                        tax: Number(tax),
                        serviceCharge: 0,
                        discountPrice: Number(discount),
                    },
                },
            });
        }


        // 6) Persist fields
        booking.additionalPriceItems = cleanedAdditional;
        booking.totalAdditionalPrice = Number(computedAdditionalTotal);

        booking.subtotal = Number(subtotal);
        booking.tax = Number(tax);
        booking.serviceCharge = Number(serviceCharge);
        booking.discount = Number(discount);
        booking.miniBar = Number(miniBar);
        booking.laundary = Number(laundary);
        booking.spa = Number(spa);

        booking.checkOutById = checkOutById;
        booking.checkOutByName = checkOutByName;

        booking.totalBill = Number(totalBill);
        booking.paymentMethod = paymentMethod;
        booking.isCheckOut = true;


        booking.oldLengthOfStay = booking.lengthOfStay;

        // Calculate new lengthOfStay = difference between checkIn and today (in nights)
        const checkInDay = dayjs(booking.checkIn).tz(TZ).startOf("day");
        const todayDay = dayjs().tz(TZ).startOf("day");
        const diffNights = Math.max(todayDay.diff(checkInDay, "day"), 1);
        booking.lengthOfStay = diffNights;

        // --- Checkout date + rooms history updates ---
        // const todayLocalNoon = dayjs()
        //     .tz(TZ)
        //     .hour(12)
        //     .minute(0)
        //     .second(0)
        //     .millisecond(0);
        //
        // const newCheckoutDate = todayLocalNoon.toDate();
        //
        // if (!dayjs(booking.checkOut).isSame(newCheckoutDate)) {
        //     booking.oldCheckOutDate = booking.checkOut;
        //     booking.oldCheckOutDateStatus = true;
        // }
        //
        // booking.checkOut = newCheckoutDate;

        // Today at noon in SL, stored as UTC
            // Always update checkout to Sri Lanka local noon
        const todayNoonSL = dayjs().tz(TZ).toDate();

            // Store old checkout if it exists
        if (booking.checkOut) {
            booking.oldCheckOutDate = booking.checkOut;
            booking.oldCheckOutDateStatus = true;
        }

        booking.checkOut = todayNoonSL;

        // booking.roomsHistory = (booking.roomsHistory || []).map((rh) => {
        //     rh.switchOutDate = newCheckoutDate;
        //     if (rh.status === "active") rh.status = "completed";
        //     return rh;
        // });

        // booking.roomsHistory = (booking.roomsHistory || []).map((rh) => {
        //     rh.switchOutDate = booking.checkOut;
        //     if (rh.status === "active") rh.status = "completed";
        //     return rh;
        // });

          // Apply switch-out logic according to your rules
            booking.roomsHistory = (booking.roomsHistory || []).map((rh) => {
                const roomsHistory = booking.roomsHistory;

                // Count same roomNo occurrences
                const sameRoomCount = roomsHistory.filter(r => r.roomNo === rh.roomNo).length;

                const todaySOD = dayjs().tz(TZ).startOf("day");
                let newSwitchOut = null;

                if (sameRoomCount > 1) {
                    // CASE 1: Multiple history records for same roomNo
                    if (rh.isSwitched === false) {
                        // Not switched → switchOut = today
                        newSwitchOut = todaySOD.toDate();
                    } else {
                        // Switched → keep existing switchOutDate
                        newSwitchOut = rh.switchOutDate ? rh.switchOutDate : todaySOD.toDate();
                    }
                } else {
                    // CASE 2: Only one record for this roomNo
                    const isActiveNow = booking.currentRooms?.some(r => r.roomNo === rh.roomNo);
                    if (isActiveNow) {
                        // Active → switchOut = today
                        newSwitchOut = todaySOD.toDate();
                    } else {
                        // Inactive → keep old
                        newSwitchOut = rh.switchOutDate ? rh.switchOutDate : todaySOD.toDate();
                    }
                }

                // Prevent future dates
                if (newSwitchOut) {
                    const outDay = dayjs(newSwitchOut).tz(TZ).startOf("day");
                    if (outDay.isAfter(todaySOD)) {
                        newSwitchOut = todaySOD.toDate();
                    }
                }

                // Persist back to DB
                rh.switchOutDate = newSwitchOut;

                // Update status if active
                if (rh.status === "active") rh.status = "completed";

                return rh;
            });

        if (Array.isArray(booking.currentRooms) && booking.currentRooms.length > 0) {
            // Find rooms that were active at the moment of checkout. Only these should be unbooked.
            const activeRooms = booking.currentRooms.filter((r) => r && r.isActive);

            // Collect active room ids prior to mutating currentRooms
            const activeRoomIds = activeRooms.map((r) => r.roomId).filter(Boolean);

            // Mark all currentRooms as no longer active in the booking document
            booking.currentRooms = booking.currentRooms.map((room) => ({
                ...room,
                isActive: false,
            }));

            // Only update Room documents for the previously active room ids
            if (activeRoomIds.length > 0) {
                await Room.updateMany(
                    { _id: { $in: activeRoomIds } },
                    { $set: { isBooked: false } },
                    { session }
                );
            }
        }

        await booking.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            message: "Booking bill updated successfully",
            bookingId: booking._id,
            data: {
                totalAdditionalPrice: booking.totalAdditionalPrice,
                subtotal: booking.subtotal,
                tax: booking.tax,
                serviceCharge: booking.serviceCharge,
                discount: booking.discount,
                totalBill: booking.totalBill,
                paymentMethod: booking.paymentMethod,
                additionalPriceItems: booking.additionalPriceItems,
                checkOut: booking.checkOut,
            },
        });
    } catch (err) {
        try {
            await session.abortTransaction();
        } catch (_) {}
        console.error("Finalize booking bill error:", err);
        return res.status(500).json({
            message: "Failed to finalize booking bill",
            error: err?.message || String(err),
        });
    } finally {
        session.endSession();
    }
};
