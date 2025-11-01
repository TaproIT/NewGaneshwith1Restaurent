
import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import Booking from "../../models/Reception/booking.js";
import Order from "../../models/order/order-model.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Colombo";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Start-of-day in Asia/Colombo
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

// Hotel-night diff, min 1 night, expects Day.js SOD inputs
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

        // 1) Load lean for calculation
        const booking = await Booking.findById(id).lean();
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const todaySOD = dayjs().tz(TZ).startOf("day");

        // ORIGINAL DB DATES (returned as-is)
        const rawCheckOut = booking.checkOut ? dayjs(booking.checkOut) : null;

        // Determine whether to force "today" as effective out date(s)
        const checkOutIsFuture = booking.checkOut ? sodTZ(booking.checkOut).isAfter(todaySOD) : false;
        const anySwitchOutFuture = Array.isArray(booking.roomsHistory)
            ? booking.roomsHistory.some(rh => rh.switchOutDate && sodTZ(rh.switchOutDate).isAfter(todaySOD))
            : false;
        const requiresCutoff = checkOutIsFuture || anySwitchOutFuture;

        // Effective dates (calc/response only)
        const effectiveCheckOut = booking.checkOut
            ? (requiresCutoff ? todaySOD : clampToTodayTZ(booking.checkOut, todaySOD))
            : null;

        const effectiveCheckIn = booking.checkIn
            ? clampToTodayTZ(booking.checkIn, todaySOD)
            : null;

        // Orders: fetch & summarise
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

        // Rooms history: compute totals using effective dates
        const roomsHistory = Array.isArray(booking.roomsHistory) ? booking.roomsHistory : [];

        const computedRoomDetails = roomsHistory.map((rh) => {
            const rawSwitchOut = rh.switchOutDate ? dayjs(rh.switchOutDate) : null;

            const effIn = rh.switchInDate ? clampToTodayTZ(rh.switchInDate, todaySOD) : null;

            let effOut;
            if (requiresCutoff) {
                effOut = todaySOD;
            } else {
                const rawOut = rh.switchOutDate ? rh.switchOutDate : (effectiveCheckOut ? effectiveCheckOut.toDate() : null);
                effOut = rawOut ? clampToTodayTZ(rawOut, todaySOD) : null;
            }

            const perDayPrice = Number(rh.perDayPrice) || 0;
            const nights = diffNightsTZ(effIn, effOut);
            const finalRoomTotalPrice = nights * perDayPrice;

            return {
                _id: rh._id ? String(rh._id) : null,
                roomId: rh.roomId ? String(rh.roomId) : null,
                roomNo: rh.roomNo,
                perDayPrice,
                effIn,
                effOut,
                rawSwitchOut, // keep raw to format later
                nights,
                finalRoomTotalPrice,
                status: rh.status ?? "no status",
                isSwitched: !!rh.isSwitched,
                switchFrom: rh.switchFrom ?? null
            };
        });

        const totalRoomsCharges = computedRoomDetails.reduce((sum, r) => sum + (Number(r.finalRoomTotalPrice) || 0), 0);
        const totalroomcount = roomsHistory.length;

        // Final totals to persist
        const finalAllRoomsTotalPrice = totalRoomsCharges;
        const totalOrdersBill = ordersTotalBill;
        const totalBill = Number(finalAllRoomsTotalPrice) + Number(totalOrdersBill);

        // 2) Persist ONLY totals (and each room's finalRoomTotalPrice) — NOT DATES
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
                rh.finalRoomTotalPrice = match.finalRoomTotalPrice;
            } else {
                const effIn = rh.switchInDate ? clampToTodayTZ(rh.switchInDate, todaySOD) : null;
                const rawOut = rh.switchOutDate ? rh.switchOutDate : (effectiveCheckOut ? effectiveCheckOut.toDate() : null);
                const effOut = rawOut ? clampToTodayTZ(rawOut, todaySOD) : null;
                const nights = diffNightsTZ(effIn, effOut);
                rh.finalRoomTotalPrice = (Number(rh.perDayPrice) || 0) * nights;
            }
            return rh;
        });

        bookingDoc.finalAllRoomsTotalPrice = finalAllRoomsTotalPrice;
        bookingDoc.totalOrdersBill = totalOrdersBill;
        bookingDoc.totalBill = totalBill;

        await bookingDoc.save();

        // Build response using effective (local) dates and ORIGINAL raw dates
        const roomDetailsForResponse = computedRoomDetails.map(r => ({
            roomId: r.roomId,
            roomNo: r.roomNo,
            perDayPrice: r.perDayPrice,

            // EFFECTIVE dates (calc/display)
            switchInDate: r.effIn ? r.effIn.format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
            switchOutDate: r.effOut ? r.effOut.format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
            switchInDateLocal: r.effIn ? r.effIn.format("YYYY-MM-DD") : null,
            switchOutDateLocal: r.effOut ? r.effOut.format("YYYY-MM-DD") : null,

            // ORIGINAL DB dates (as requested)
            rawSwitchOutDate: r.rawSwitchOut ? r.rawSwitchOut.toISOString() : null, // UTC ISO from DB
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
            guestName: booking.guestName,

            // EFFECTIVE (calc/display)
            checkIn:  effectiveCheckIn ? effectiveCheckIn.format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
            checkOut: effectiveCheckOut ? effectiveCheckOut.format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
            checkInDateLocal:  effectiveCheckIn ? effectiveCheckIn.format("YYYY-MM-DD") : null,
            checkOutDateLocal: effectiveCheckOut ? effectiveCheckOut.format("YYYY-MM-DD") : null,

            // ORIGINAL DB check-out (as requested)
            rawCheckOut: rawCheckOut ? rawCheckOut.toISOString() : null,             // UTC ISO from DB
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


function toCents(n) {
    return Math.round(Number(n || 0) * 100);
}


export const postBookingCheckout = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { id } = req.params;
        const {
            clientTotalBill,
            sameDayExtra = 0,
            noteForSameDayCheckinAndCheckout = ""
        } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid booking id" });
        }

        const todaySOD = dayjs().tz(TZ).startOf("day");

        // 1) Load booking
        const booking = await Booking.findById(id).lean();
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.isCheckOut === true)
            return res.status(400).json({ message: "Booking already checked out" });

        // 2) Validate date rules
        const rawCheckInSOD  = booking.checkIn  ? sodTZ(booking.checkIn)  : null;
        const rawCheckOutSOD = booking.checkOut ? sodTZ(booking.checkOut) : null;

        if (rawCheckInSOD && rawCheckInSOD.isAfter(todaySOD)) {
            return res.status(400).json({ message: "Check-in date cannot be in the future" });
        }
        if (rawCheckOutSOD && rawCheckOutSOD.isBefore(todaySOD)) {
            return res.status(400).json({ message: "Check-out date must be today or in the future" });
        }

        // Effective “future -> today” for calculations
        const requiresCutoff =
            (rawCheckOutSOD ? rawCheckOutSOD.isAfter(todaySOD) : false) ||
            ((booking.roomsHistory || []).some(
                (rh) => rh.switchOutDate && sodTZ(rh.switchOutDate).isAfter(todaySOD)
            ));

        const effectiveCheckOut = booking.checkOut
            ? (requiresCutoff ? todaySOD : clampToTodayTZ(booking.checkOut, todaySOD))
            : null;
        const effectiveCheckIn = booking.checkIn
            ? clampToTodayTZ(booking.checkIn, todaySOD)
            : null;

        // 3) Orders total
        const orderIds = (booking.orders || []).map((o) => o?.oderId).filter(Boolean);
        const orders = orderIds.length
            ? await Order.find({ _id: { $in: orderIds } }).lean()
            : [];
        const totalOrdersBill = orders.reduce((sum, o) => sum + (Number(o.totalBill) || 0), 0);

        // 4) Calculate rooms total from history using effective dates
        const roomsHistory = Array.isArray(booking.roomsHistory) ? booking.roomsHistory : [];
        const computedRoomTotals = roomsHistory.map((rh) => {
            const effIn = rh.switchInDate ? clampToTodayTZ(rh.switchInDate, todaySOD) : null;
            const rawOut = rh.switchOutDate
                ? rh.switchOutDate
                : effectiveCheckOut
                    ? effectiveCheckOut.toDate()
                    : null;
            const effOut = requiresCutoff
                ? todaySOD
                : rawOut
                    ? clampToTodayTZ(rawOut, todaySOD)
                    : null;
            const perDayPrice = Number(rh.perDayPrice) || 0;
            const nights = diffNightsTZ(effIn, effOut);
            return nights * perDayPrice;
        });
        let finalAllRoomsTotalPrice = computedRoomTotals.reduce((s, v) => s + v, 0);

        // 5) Same-day branch
        const isSameDay =
            effectiveCheckIn && effectiveCheckOut &&
            effectiveCheckIn.isSame(effectiveCheckOut, "day");

        if (isSameDay) {
            // REQUIREMENTS
            if (!noteForSameDayCheckinAndCheckout || !String(noteForSameDayCheckinAndCheckout).trim()) {
                return res.status(400).json({
                    message: "noteForSameDayCheckinAndCheckout is required for same-day check-in/out",
                });
            }
            if (!sameDayExtra || Number(sameDayExtra) <= 0) {
                return res.status(400).json({
                    message: "A positive sameDayExtra is required for same-day check-in/out",
                });
            }

            // RULES YOU ASKED:
            // - sameDayExtra is the *room charge* for same-day (override computed rooms)
            // - totalBill = finalAllRoomsTotalPrice + totalOrdersBill
            finalAllRoomsTotalPrice = Number(sameDayExtra);
        } else {
            // Non-same-day: enforce client vs backend total verification
            if (clientTotalBill == null) {
                return res.status(400).json({ message: "clientTotalBill is required for non-same-day checkout" });
            }
        }

        // backend total with the (possibly overridden) finalAllRoomsTotalPrice
        const backendGrandTotal = Number(finalAllRoomsTotalPrice) + Number(totalOrdersBill);

        // For non-same-day, verify client vs backend
        if (!isSameDay) {
            const equalTotals = toCents(clientTotalBill) === toCents(backendGrandTotal);
            if (!equalTotals) {
                return res.status(400).json({
                    message: "clientTotalBill mismatch",
                    backendGrandTotal,
                    clientTotalBill,
                });
            }
        }

        // 6) Persist updates (including special-case future date -> today) inside a transaction
        await session.withTransaction(async () => {
            const bookingDoc = await Booking.findById(id).session(session);
            if (!bookingDoc) throw new Error("Booking not found during checkout");

            // Special-case: if future, set to today (these date updates happen on successful checkout)
            const docCheckOutSOD = bookingDoc.checkOut ? sodTZ(bookingDoc.checkOut) : null;
            if (docCheckOutSOD && docCheckOutSOD.isAfter(todaySOD)) {
                bookingDoc.checkOut = todaySOD.toDate();
            }
            bookingDoc.roomsHistory = bookingDoc.roomsHistory.map((rh) => {
                const rhSodOut = rh.switchOutDate ? sodTZ(rh.switchOutDate) : null;
                if (rhSodOut && rhSodOut.isAfter(todaySOD)) {
                    rh.switchOutDate = todaySOD.toDate();
                }
                // Recompute each room's finalRoomTotalPrice with clamped dates (kept consistent)
                const effIn = rh.switchInDate ? clampToTodayTZ(rh.switchInDate, todaySOD) : null;
                const effOut = rh.switchOutDate
                    ? clampToTodayTZ(rh.switchOutDate, todaySOD)
                    : todaySOD; // conservative fallback
                const perDayPrice = Number(rh.perDayPrice) || 0;
                const nights = diffNightsTZ(effIn, effOut);
                rh.finalRoomTotalPrice = nights * perDayPrice;
                return rh;
            });

            // Aggregate per-room totals (after recompute)
            const recomputedRoomsSum = bookingDoc.roomsHistory
                .reduce((s, rh) => s + (Number(rh.finalRoomTotalPrice) || 0), 0);

            // Persist the three totals you track, with same-day rule applied:
            bookingDoc.totalOrdersBill = totalOrdersBill;

            if (isSameDay) {
                // sameDayExtra is the authoritative room total for same-day checkouts
                bookingDoc.finalAllRoomsTotalPrice = Number(sameDayExtra);
                bookingDoc.noteForSameDayCheckinAndCheckout = String(noteForSameDayCheckinAndCheckout);
            } else {
                // normal case: use recomputed sum from history
                bookingDoc.finalAllRoomsTotalPrice = recomputedRoomsSum;
            }

            // totalBill rule (both cases): rooms + orders
            bookingDoc.totalBill =
                Number(bookingDoc.finalAllRoomsTotalPrice) + Number(bookingDoc.totalOrdersBill);

            bookingDoc.isCheckOut = true;

            await bookingDoc.save({ session });
        });

        // 7) Respond success
        return res.status(200).json({
            message: "Checkout successful",
            bookingId: id,
            isCheckOut: true,
            sameDayApplied: isSameDay,
            totals: {
                finalAllRoomsTotalPrice, // sameDayExtra if same-day, else computed rooms sum
                totalOrdersBill,
                totalBill: backendGrandTotal
            },
            dates: {
                effectiveCheckIn: effectiveCheckIn ? effectiveCheckIn.format("YYYY-MM-DD") : null,
                effectiveCheckOut: effectiveCheckOut ? effectiveCheckOut.format("YYYY-MM-DD") : null,
                specialCaseApplied: requiresCutoff
            }
        });

    } catch (err) {
        console.error("postBookingCheckout error:", err);
        return res.status(500).json({ message: "Server error", error: err?.message || err });
    } finally {
        session.endSession();
    }
};

