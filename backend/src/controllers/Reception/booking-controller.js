import mongoose from "mongoose";
import Booking from "../../models/Reception/booking.js";
import Room from "../../models/Room.js";
import {generateAndUploadQr} from "../../utils/qr.js";
import {sendWhatsAppMessage} from "../../utils/sendWhatsAppMessage.js";
import {findActiveBookingByRoomNo} from "../../utils/findActiveBookingByRoomNo.js";
import nodemailer from "nodemailer";
import { sendErrorResponse, sendSuccessResponse } from "../../utils/response-util.js";
import User from "../../models/user/user-model.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Colombo";


// Function to validate incoming body data
function validateCreateBookingBody(body) {
    const required = [
        "guestName", "country", "totalGuests", "lengthOfStay", "checkIn", "checkOut", "hotel", "currentRooms"
    ];

    const missing = required.filter((k) => body[k] === undefined || body[k] === null);
    if (missing.length) {
        const err = new Error(`Missing required fields: ${missing.join(", ")}`);
        err.status = 400;
        throw err;
    }

    if (!Array.isArray(body.currentRooms) || body.currentRooms.length === 0) {
        const err = new Error("currentRooms must be a non-empty array of room numbers.");
        err.status = 400;
        throw err;
    }
}

export const createBooking = async (req, res) => {
    try {
        // Validate request body
        validateCreateBookingBody(req.body);

        const {
            guestName,
            country,
            passportId,
            totalGuests,
            lengthOfStay,
            email,
            whatsapp,
            checkIn,
            checkOut,
            hotel,
            currentRooms,
            payload,
            adults,
            kids,
            customerType,
            breakfast,
        } = req.body;

        const createdById = req.user?.userId || req.user?._id;

        // 🕓 Convert to Sri Lankan date/time (force to Colombo timezone)
        const todaySL = dayjs().tz(TZ).startOf("day");
        const checkInSL = checkIn
            ? dayjs.tz(checkIn, TZ).startOf("day").toDate()
            : todaySL.add(lengthOfStay, "day").toDate(); // ✅ always today's date in Sri Lanka

        // If checkOut provided, normalize to SL timezone, else fallback to default duration
        let checkOutSL = checkOut
            ? dayjs.tz(checkOut, TZ).startOf("day").toDate()
            : todaySL.add(lengthOfStay, "day").toDate();

        // ✅ Validate check-out (must be today or future)
        if (dayjs(checkOutSL).isBefore(todaySL, "day")) {
            return res.status(400).json({
                error: "Check-out date cannot be before today's Sri Lankan date.",
            });
        }

        const trimmedGuestName = typeof guestName === "string" ? guestName.trim() : "";
        const trimmedCountry = typeof country === "string" ? country.trim() : "";
        const trimmedEmail = typeof email === "string" ? email.trim() : undefined;
        const trimmedWhatsapp = typeof whatsapp === "string" ? whatsapp.trim() : undefined;
        const trimmedPassportId = typeof passportId === "string" ? passportId.trim() : undefined;
        const trimmedHotel = typeof hotel === "string" ? hotel.trim() : "";
        const trimmedCustomerType = typeof customerType === "string" ? customerType.trim() : "";
        const trimmedBreakfast = typeof breakfast === "string" ? breakfast.trim() : "";
        const trimmedCreatedById = typeof createdById === "string" ? createdById.trim() : "";

        if (!trimmedCreatedById) {
            return res.status(400).json({ error: "ID is required. unauthorized creation" });
        }
        console.log(trimmedCreatedById);

        const checkInDate = dayjs(checkInSL).tz(TZ).startOf("day");
        const checkOutDate = dayjs(checkOutSL).tz(TZ).startOf("day");
        const actualLengthOfStay = checkOutDate.diff(checkInDate, "day");

        console.log("Check-in:", checkInDate.format(), "Check-out:", checkOutDate.format(), "Actual days:", actualLengthOfStay);

        // ✅ Validate that provided lengthOfStay matches actual date difference
        if (lengthOfStay !== actualLengthOfStay) {
            return res.status(400).json({
                error: `Length of stay (${lengthOfStay} days) does not match the actual period between check-in and check-out (${actualLengthOfStay} days).`,
            });
        }

        if (checkInDate.isAfter(checkOutDate, "day")) {
            return res.status(400).json({
                error: "Check-in date cannot be after check-out date.",
            });
        }

        // Fetch user info
        const user = await User.findById(trimmedCreatedById).lean();
        if (!user) {
            return res.status(404).json({ error: "User not found. Invalid createdById." });
        }

        const createdByName = user.name;

        // Normalize currentRooms (support string[] or {roomNo, price}[])
        const normalizedRooms = currentRooms.map((r) =>
            typeof r === "string" ? { roomNo: r } : r
        );

        // Fetch room details from DB
        const rooms = await Room.find({
            no: { $in: normalizedRooms.map((room) => room.roomNo) },
            isBooked: false,
        }).lean();

        if (rooms.length !== normalizedRooms.length) {
            return res
                .status(400)
                .json({ error: "Some rooms are already booked or not found." });
        }

        // Create QR code
        let qr;
        try {
            qr = await generateAndUploadQr({
                name: trimmedGuestName,
                roomNumbers: normalizedRooms.map((room) => room.roomNo),
                checkIn: checkInSL,
                checkOut: checkOutSL,
                hotel: trimmedHotel,
            });
        } catch (qrErr) {
            console.error("[QR] generation/upload failed:", qrErr);
            return res.status(500).json({ error: "Failed to generate booking QR." });
        }

        // Start DB session
        const session = await mongoose.startSession();
        let newBooking;

        try {
            await session.withTransaction(async () => {
                // Mark rooms as booked
                const { modifiedCount } = await Room.updateMany(
                    { no: { $in: normalizedRooms.map((room) => room.roomNo) }, isBooked: false },
                    { $set: { isBooked: true } },
                    { session }
                );

                if (modifiedCount !== normalizedRooms.length) {
                    throw Object.assign(new Error("One or more rooms are unavailable."), {
                        status: 409,
                    });
                }

                // Create booking document
                newBooking = await Booking.create(
                    [
                        {
                            guestName: trimmedGuestName,
                            country: trimmedCountry,
                            passportId: trimmedPassportId,
                            createdById: trimmedCreatedById,
                            createdByName: createdByName,
                            totalGuests,
                            lengthOfStay,
                            oldLengthOfStay: lengthOfStay,
                            checkIn,
                            checkOut,
                            hotel: trimmedHotel,
                            whatsapp: trimmedWhatsapp,
                            email: trimmedEmail,
                            adults,
                            kids,
                            // ✅ Map currentRooms with price logic
                            currentRooms: normalizedRooms.map((room) => {
                                const dbRoom = rooms.find((r) => r.no === room.roomNo);
                                const finalPrice = room.price ?? dbRoom.perDayPrice; // ✅ NEW
                                const currency = room.currency ?? dbRoom.currency ?? "LKR";
                                return {
                                    roomId: dbRoom._id,
                                    roomNo: room.roomNo,
                                    price: finalPrice, // ✅ store provided or default price
                                    currency,
                                    isActive: true,
                                };
                            }),
                            payload,
                            qrPublicId: qr.publicId,
                            qrUrl: qr.url,
                            bookingDate: new Date(),
                            isCheckOut: false,
                            customerType: trimmedCustomerType,
                            breakfast: trimmedBreakfast,
                        },
                    ],
                    { session }
                );

                // ✅ Update roomsHistory with room-specific price
                for (const room of normalizedRooms) {
                    const dbRoom = rooms.find((r) => r.no === room.roomNo);
                    const finalPrice = room.price ?? dbRoom.perDayPrice; // ✅ fallback
                    const currency = room.currency ?? dbRoom.currency ?? "LKR";
                    newBooking[0].roomsHistory.push({
                        roomId: dbRoom._id,
                        roomNo: dbRoom.no,
                        perDayPrice: finalPrice,
                        night: lengthOfStay,
                        currency,
                        finalRoomTotalPrice: finalPrice * lengthOfStay, // ✅ computed
                        switchInDate: checkIn,
                        switchOutDate: checkOut,
                        isSwitched: false,
                        status: "active",
                        perDayPriceHistory: [
                            { price: finalPrice, currency, date: new Date() }, // 🗂 save price snapshot
                        ],
                    });
                }

                await newBooking[0].save({ session });
            });
        } catch (txnErr) {
            console.log(txnErr);
            const status = txnErr.status || 500;
            return res.status(status).json({
                error:
                    status === 409
                        ? "One or more rooms became unavailable. Please try different rooms."
                        : "Failed to finalize booking.",
            });
        } finally {
            session.endSession();
        }

        return res.status(201).json({ bookingId: newBooking?.[0]._id });
    } catch (err) {
        console.error(err);
        const status = err.status || 500;
        return res.status(status).json({
            error: status === 400 ? err.message : "Internal server error",
        });
    }
};

// GET /api/bookings/:id
export const getSpecificBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid booking ID" });
        }

        // Populate optional references (Room, User, etc.)
        const booking = await Booking.findById(id)
            .populate("currentRooms.roomId", "roomNo price")
            .populate("createdById", "name")
            .populate("checkOutById", "name")
            .populate("updatesHistory.updateUserId", "name email")
            .lean();

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Format or filter only needed data
        const formattedData = {
            uniqueBookingId: booking.uniqueBookingId,
            guestName: booking.guestName,
            country: booking.country,
            email: booking.email,
            whatsapp: booking.whatsapp,
            totalGuests: booking.totalGuests,
            kids: booking.kids,
            adults: booking.adults,
            checkOut: booking.checkOut,
            currentRooms: booking.currentRooms?.map(r => ({
                roomNo: r.roomNo,
                price: r.price,
            })),
            updatesHistory: booking.updatesHistory?.map(u => ({
                updateUserId: u.updateUserId?._id,
                updatedByName: u.updatedByName,
                updateDate: u.updateDate,
            })),
        };

        res.status(200).json({
            success: true,
            message: "Booking details fetched successfully",
            data: formattedData,
        });
    } catch (err) {
        console.error("Error fetching booking details:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};


// Controller to create a booking
// export const createBooking = async (req, res) => {
//     try {
//         // Validate incoming data
//         validateCreateBookingBody(req.body);
//
//         // Extract data from the request body
//         const {
//             guestName, country, passportId, totalGuests, lengthOfStay, email, whatsapp,
//             checkIn, checkOut, hotel, currentRooms, payload, adults, kids,
//             customerType, breakfast, createdById
//         } = req.body;
//
//         const trimmedGuestName = guestName.trim();
//         const trimmedCountry = country.trim();
//         const trimmedEmail = email ? email.trim() : undefined;
//         const trimmedWhatsapp = whatsapp ? whatsapp.trim() : undefined;
//         const trimmedPassportId = passportId ? passportId.trim() : undefined;
//         const trimmedHotel = hotel.trim();
//         const trimmedCustomerType = customerType.trim();
//         const trimmedBreakfast = breakfast.trim();
//         const trimmedCreatedById = createdById.trim();
//         if (!trimmedCreatedById) {
//             return res.status(400).json({ error: "createdById is required." });
//         }
//
//         // Fetch user info
//         const user = await User.findById(trimmedCreatedById).lean();
//         if (!user) {
//             return res.status(404).json({ error: "User not found. Invalid createdById." });
//         }
//
//         const createdByName = user.name;
//
//         // Normalize currentRooms (support string[] or {roomNo}[])
//         const normalizedRooms = currentRooms.map(r =>
//             typeof r === "string" ? { roomNo: r } : r
//         );
//
//         // Validate required update fields
//         if (!trimmedCreatedById ) {
//             return res.status(400).json({
//                 error: "createdUserId are required."
//             });
//         }
//
//         // Fetch room details
//         const rooms = await Room.find({
//             no: { $in: normalizedRooms.map(room => room.roomNo) },
//             isBooked: false,
//         }).lean();
//
//         if (rooms.length !== normalizedRooms.length) {
//             return res.status(400).json({
//                 error: "Some rooms are already booked or not found.",
//             });
//         }
//
//         // Create QR code
//         let qr;
//         try {
//             qr = await generateAndUploadQr({
//                 name: trimmedGuestName,
//                 roomNumbers: normalizedRooms.map(room => room.roomNo),
//                 checkIn,
//                 checkOut,
//                 hotel: trimmedHotel,
//             });
//         } catch (qrErr) {
//             console.error("[QR] generation/upload failed:", qrErr);
//             return res.status(500).json({ error: "Failed to generate booking QR." });
//         }
//
//         // Start a session
//         const session = await mongoose.startSession();
//         let newBooking;
//
//         try {
//             await session.withTransaction(async () => {
//                 // Mark rooms as booked
//                 const { modifiedCount } = await Room.updateMany(
//                     { no: { $in: normalizedRooms.map(room => room.roomNo) }, isBooked: false },
//                     { $set: { isBooked: true } },
//                     { session }
//                 );
//
//                 if (modifiedCount !== normalizedRooms.length) {
//                     throw Object.assign(new Error("One or more rooms are unavailable."), { status: 409 });
//                 }
//
//                 // Create booking
//                 newBooking = await Booking.create(
//                     [
//                         {
//                             guestName: trimmedGuestName,
//                             country: trimmedCountry,
//                             passportId: trimmedPassportId,
//                             createdById:trimmedCreatedById,
//                             createdByName: createdByName,
//                             totalGuests,
//                             lengthOfStay,
//                             checkIn,
//                             checkOut,
//                             hotel: trimmedHotel,
//                             whatsapp: trimmedWhatsapp,
//                             email: trimmedEmail,
//                             adults,
//                             kids,
//                             currentRooms: normalizedRooms.map(room => ({
//                                 roomId: rooms.find(r => r.no === room.roomNo)._id,
//                                 roomNo: room.roomNo,
//                                 perDayPrice: perDayPrice ?? room.perDayPrice,
//                                 isActive: true,
//                             })),
//                             payload,
//                             qrPublicId: qr.publicId,
//                             qrUrl: qr.url,
//                             bookingDate: new Date(),
//                             isCheckOut: false,
//
//                             customerType: trimmedCustomerType,
//                             breakfast: trimmedBreakfast,
//                         },
//                     ],
//                     { session }
//                 );
//
//                 // Add room history for all booked rooms
//                 for (const room of rooms) {
//                     newBooking[0].roomsHistory.push({
//                         roomId: room._id,
//                         roomNo: room.no,
//                         perDayPrice: perDayPrice ?? room.perDayPrice,
//                         roomTotalPrice: (perDayPrice ?? room.perDayPrice) * lengthOfStay,
//                         switchInDate: checkIn,
//                         switchOutDate: checkOut, // planned checkout
//                         isSwitched: false,
//                         status: 'active',
//                     });
//                 };
//
//                 await newBooking[0].save({ session });
//             });
//         } catch (txnErr) {
//             console.log(txnErr)
//             const status = txnErr.status || 500;
//             return res.status(status).json({
//                 error:
//                     status === 409
//                         ? "One or more rooms became unavailable. Please try different rooms."
//                         : "Failed to finalize booking.",
//             });
//         } finally {
//             session.endSession();
//         }
//
//         return res.status(201).json({ bookingId: newBooking?.[0]._id });
//     } catch (err) {
//         const status = err.status || 500;
//         return res.status(status).json({
//             error: status === 400 ? err.message : "Internal server error",
//         });
//     }
// };

export const sendBookingQrViaEmail = async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    try {
        const booking = await Booking.findById(id).lean();
        if (!booking) return res.status(404).json({ error: "Booking not found" });
        if (!booking.email) return res.status(400).json({ error: "No email found for this booking" });

        const defaultMessage = `Hello ${booking.guestName}, your booking is confirmed!
                Booking ID: ${booking._id}
                Hotel: ${booking.hotel}
                Total Guests: ${booking.totalGuests}
                Check-in: ${new Date(booking.checkIn).toDateString()}
                Check-out: ${new Date(booking.checkOut).toDateString()}
                QR attached for your booking.`;

        const finalMessage = message || defaultMessage;

        await sendEmailMessage(booking.email, finalMessage, booking.qrUrl);

        return res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (err) {
        console.error(" Email send error:", err);
        return res.status(500).json({ error: "Failed to send email" });
    }
};

export const sendBookingQrViaWhatsApp = async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    try {
        const booking = await Booking.findById(id).lean();
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (!booking.whatsapp) {
            return res.status(400).json({ error: "Booking does not have WhatsApp number" });
        }

        const defaultMessage = `Hello ${booking.guestName}, your booking is confirmed!
            Booking ID: ${booking._id}
            Hotel: ${booking.hotel}
            Total: $${booking.totalPrice}
            Check-in: ${new Date(booking.checkIn).toDateString()}
            Check-out: ${new Date(booking.checkOut).toDateString()}
            QR attached for your booking.`;

        const finalMessage = message || defaultMessage;

        const whatsappLink = await sendWhatsAppMessage(booking.whatsapp, finalMessage, booking.qrUrl);

        return res.status(200).json({
            success: true,
            message: "WhatsApp link generated successfully",
            whatsappLink
        });

    } catch (err) {
        return res.status(500).json({ error: "Failed to generate WhatsApp link" });
    }
};

// Get All room details for particular booking
export const getBookingWithActiveRoomsAndPrices = async (req, res) => {
    try {
        const { roomNo } = req.params;

        const bookingId = await findActiveBookingByRoomNo(roomNo);
        const room = await Room.findOne({no: roomNo});
        console.log(room)

        if (!bookingId) {
            return res.status(404).json({ message: "No active booking found for this room." });
        }

        // Fetch booking details
        const booking = await Booking.findById(bookingId)
            .populate("currentRooms.roomId")
            .populate("roomsHistory.roomId");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        //  Extract ALL active rooms
        const activeRooms = booking.currentRooms.filter(room => room.isActive);

        // Build details for each active room
        const activeRoomDetails = activeRooms.map(activeRoom => {
            // Find history entry where isSwitched = false for this room
            const historyEntry = booking.roomsHistory.find(
                h => h.roomNo === activeRoom.roomNo && h.isSwitched === false
            );

            let perDayPrice = historyEntry ? historyEntry.perDayPrice : activeRoom.roomId.perDayPrice;
            let switchInDate = historyEntry ? historyEntry.switchInDate : booking.checkIn;
            let switchOutDate = historyEntry && historyEntry.switchOutDate ? historyEntry.switchOutDate : booking.checkOut;
            let currency = historyEntry && historyEntry.currency ;

            // Calculate total days (inclusive of switchInDate, exclusive of switchOutDate)
            const diffTime = new Date(switchOutDate) - new Date(switchInDate);
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convert ms -> days

            const roomTotalPrice = perDayPrice * days;

            return {
                roomNo: activeRoom.roomNo,
                type: activeRoom.roomId.type,
                facilities: activeRoom.roomId.facilities,
                perDayPrice,
                switchInDate,
                switchOutDate,
                roomTotalPrice,
                currency,
                defaultPrice: room.perDayPrice
            };
        });

        const responseData = {
            bookingId: booking._id,
            guestName: booking.guestName,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            activeRooms: activeRoomDetails
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error("Error fetching booking with active rooms and prices:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// // Switch rooms with proper isSwitched status
// export const switchRoomsBulk = async (req, res) => {
//     const { bookingId } = req.params;
//     const { oldRooms, newRooms } = req.body;
//
//     if (!Array.isArray(oldRooms) || !Array.isArray(newRooms)) {
//         return res.status(400).json({ error: "oldRooms and newRooms must be arrays" });
//     }
//
//     const today = new Date();
//
//     try {
//         // Fetch booking
//         const booking = await Booking.findById(bookingId);
//         if (!booking) throw Object.assign(new Error("Booking not found"), { status: 404 });
//
//         // Fetch all old and new rooms in one query
//         const allRoomNumbers = [...oldRooms.map(r => r.roomNo), ...newRooms];
//         const rooms = await Room.find({ no: { $in: allRoomNumbers } });
//         const roomMap = Object.fromEntries(rooms.map(r => [r.no, r]));
//
//         // Validate rooms
//         oldRooms.forEach(o => {
//             if (!booking.currentRooms.some(r => r.roomNo === o.roomNo && r.isActive)) {
//                 throw Object.assign(new Error(`Old room ${o.roomNo} not found or inactive`), { status: 400 });
//             }
//             if (!roomMap[o.roomNo]) throw Object.assign(new Error(`Old room ${o.roomNo} not found`), { status: 400 });
//         });
//
//         newRooms.forEach(no => {
//             if (!roomMap[no]) throw Object.assign(new Error(`New room ${no} not found`), { status: 400 });
//             if (roomMap[no].isBooked) throw Object.assign(new Error(`New room ${no} is already booked`), { status: 400 });
//         });
//
//         // Process old rooms in memory and mark as inactive
//         const oldRoomNumbers = oldRooms.map(r => r.roomNo);
//         booking.currentRooms.forEach(r => {
//             const oldData = oldRooms.find(o => o.roomNo === r.roomNo);
//             if (oldData && r.isActive) {
//                 r.isActive = false;
//                 const hist = booking.roomsHistory.find(h => h.roomNo === r.roomNo && !h.isSwitched);
//                 if (hist) {
//                     hist.switchOutDate = today;
//                     hist.isSwitched = true;
//                     hist.status = "switched_out";
//                     hist.switchFrom = newRooms.join(", ");
//                     hist.discountPrice = oldData.discountPrice;
//                     hist.finalRoomTotalPrice = oldData.finalRoomTotalPrice;
//                 }
//             }
//         });
//
//         //  Update old rooms in Room model in bulk
//         await Room.updateMany(
//             { no: { $in: oldRoomNumbers } },
//             { $set: { isBooked: false } }
//         );
//
//         //  Process new rooms: add to booking and history
//         const newHistories = [];
//         const newCurrentRooms = newRooms.map(no => {
//             const r = roomMap[no];
//             r.isBooked = true; // mark booked in memory
//             newHistories.push({
//                 roomId: r._id,
//                 roomNo: r.no,
//                 perDayPrice: r.perDayPrice,
//                 finalRoomTotalPrice: null,
//                 discountPrice: null,
//                 switchInDate: today,
//                 switchOutDate: booking.checkOut,
//                 isSwitched: false,
//                 status: "switched_in",
//                 switchFrom: oldRooms.map(o => o.roomNo).join(", "),
//             });
//             return { roomId: r._id, roomNo: r.no, isActive: true };
//         });
//
//         booking.currentRooms.push(...newCurrentRooms);
//         booking.roomsHistory.push(...newHistories);
//
//         // Update new rooms in Room model in bulk
//         await Room.updateMany(
//             { no: newRooms },
//             { $set: { isBooked: true } }
//         );
//
//         // Regenerate QR
//         const activeRooms = booking.currentRooms.filter(r => r.isActive).map(r => r.roomNo);
//         const qr = await generateAndUploadQr({
//             name: booking.guestName,
//             roomNumbers: activeRooms,
//             checkIn: booking.checkIn,
//             checkOut: booking.checkOut,
//             hotel: booking.hotel,
//         });
//         booking.qrPublicId = qr.publicId;
//         booking.qrUrl = qr.url;
//
//         // 9. Save booking
//         await booking.save();
//
//         return res.status(200).json({
//             message: "Rooms switched successfully",
//             bookingId: booking._id,
//             currentRooms: activeRooms,
//             qrUrl: booking.qrUrl
//         });
//
//     } catch (err) {
//         console.error("Switch rooms error:", err);
//         return res.status(err.status || 500).json({ error: err.message || "Failed to switch rooms" });
//     }
// };

// Switch rooms with proper isSwitched status and currency handling

// // Switch rooms with proper isSwitched status
// export const switchRoomsBulk = async (req, res) => {
//     const { bookingId } = req.params;
//     const { oldRooms, newRooms } = req.body;
//
//     if (!Array.isArray(oldRooms) || !Array.isArray(newRooms)) {
//         return res.status(400).json({ error: "oldRooms and newRooms must be arrays" });
//     }
//
//     const today = new Date();
//
//     try {
//         // Fetch booking
//         const booking = await Booking.findById(bookingId);
//         if (!booking) throw Object.assign(new Error("Booking not found"), { status: 404 });
//
//         // Validate old rooms: must exist in currentRooms with isActive=true
//         oldRooms.forEach(roomNo => {
//             if (!booking.currentRooms.some(r => r.roomNo === roomNo && r.isActive)) {
//                 throw Object.assign(new Error(`Old room ${roomNo} not found or inactive in current booking`), { status: 400 });
//             }
//         });
//
//         // Fetch all new room documents
//         const newRoomNumbers = newRooms.map(r => r.roomNo);
//         const rooms = await Room.find({ no: { $in: newRoomNumbers } });
//         const roomMap = Object.fromEntries(rooms.map(r => [r.no, r]));
//
//         // Validate new rooms
//         newRooms.forEach(nr => {
//             const r = roomMap[nr.roomNo];
//             if (!r) throw Object.assign(new Error(`New room ${nr.roomNo} not found`), { status: 400 });
//             if (r.isBooked) throw Object.assign(new Error(`New room ${nr.roomNo} is already booked`), { status: 400 });
//         });
//
//         // --- Process old rooms ---
//         booking.currentRooms.forEach(r => {
//             if (oldRooms.includes(r.roomNo) && r.isActive) {
//                 r.isActive = false;
//                 const hist = booking.roomsHistory.find(h => h.roomNo === r.roomNo && !h.isSwitched);
//                 if (hist) {
//                     hist.switchOutDate = today;
//                     hist.isSwitched = true;
//                     hist.status = "switched_out";
//                     hist.switchFrom = newRoomNumbers.join(", ");
//                     // Retain existing finalRoomTotalPrice, discountPrice, currency
//                 }
//             }
//         });
//
//         await Room.updateMany(
//             { no: { $in: oldRooms } },
//             { $set: { isBooked: false } }
//         );
//
//         // --- Process new rooms ---
//         const newHistories = [];
//         const newCurrentRooms = newRooms.map(nr => {
//             const r = roomMap[nr.roomNo];
//             // Use given perDayPrice & currency if provided, else defaults from Room
//             const perDayPrice = nr.perDayPrice != null ? nr.perDayPrice : r.perDayPrice;
//             const currency = nr.currency || r.currency;
//
//             newHistories.push({
//                 roomId: r._id,
//                 roomNo: r.no,
//                 perDayPrice,
//                 currency,
//                 finalRoomTotalPrice: nr.finalRoomTotalPrice || null,
//                 discountPrice: nr.discountPrice || null,
//                 switchInDate: today,
//                 switchOutDate: booking.checkOut,
//                 isSwitched: false,
//                 status: "switched_in",
//                 switchFrom: oldRooms.join(", ")
//             });
//
//             return {
//                 roomId: r._id,
//                 roomNo: r.no,
//                 isActive: true,
//                 perDayPrice,
//                 currency
//             };
//         });
//
//         booking.currentRooms.push(...newCurrentRooms);
//         booking.roomsHistory.push(...newHistories);
//
//         await Room.updateMany(
//             { no: newRoomNumbers },
//             { $set: { isBooked: true } }
//         );
//
//         // --- Regenerate QR ---
//         const activeRooms = booking.currentRooms.filter(r => r.isActive).map(r => r.roomNo);
//         const qr = await generateAndUploadQr({
//             name: booking.guestName,
//             roomNumbers: activeRooms,
//             checkIn: booking.checkIn,
//             checkOut: booking.checkOut,
//             hotel: booking.hotel,
//         });
//         booking.qrPublicId = qr.publicId;
//         booking.qrUrl = qr.url;
//
//         // 9. Save booking
//         await booking.save();
//
//         return res.status(200).json({
//             message: "Rooms switched successfully",
//             bookingId: booking._id,
//             currentRooms: activeRooms,
//             qrUrl: booking.qrUrl
//         });
//
//     } catch (err) {
//         console.error("Switch rooms error:", err);
//         return res.status(err.status || 500).json({ error: err.message || "Failed to switch rooms" });
//     }
// };

export const switchRoomsBulk = async (req, res) => {
    const { bookingId } = req.params;
    const { oldRooms, newRooms } = req.body;

    if (!Array.isArray(oldRooms) || !Array.isArray(newRooms)) {
        return res.status(400).json({ error: "oldRooms and newRooms must be arrays" });
    }

    const today = new Date();

    try {
        // 1️⃣ Fetch booking
        const booking = await Booking.findById(bookingId);
        if (!booking) throw Object.assign(new Error("Booking not found"), { status: 404 });

        // 2️⃣ Validate old rooms
        for (const oldRoomObj of oldRooms) {
            const currentRoom = booking.currentRooms.find(r => r.roomNo === oldRoomObj.roomNo && r.isActive);
            if (!currentRoom) {
                throw Object.assign(new Error(`Old room ${oldRoomObj.roomNo} not found or inactive in current booking`), { status: 400 });
            }

            // If request includes currency, it must match current room’s currency
            if (oldRoomObj.currency && oldRoomObj.currency !== currentRoom.currency) {
                throw Object.assign(new Error(`Currency mismatch for old room ${oldRoomObj.roomNo}. Expected ${currentRoom.currency}`), { status: 400 });
            }
        }

        // 3️⃣ Fetch and map new rooms
        const newRoomNumbers = newRooms.map(r => r.roomNo);
        const rooms = await Room.find({ no: { $in: newRoomNumbers } });
        const roomMap = Object.fromEntries(rooms.map(r => [r.no, r]));

        // 4️⃣ Validate new rooms
        for (const nr of newRooms) {
            const r = roomMap[nr.roomNo];
            if (!r) throw Object.assign(new Error(`New room ${nr.roomNo} not found`), { status: 400 });
            if (r.isBooked) throw Object.assign(new Error(`New room ${nr.roomNo} is already booked`), { status: 400 });
        }

        // 5️⃣ Process old rooms
        booking.currentRooms.forEach(cr => {
            const oldRoomData = oldRooms.find(o => o.roomNo === cr.roomNo);
            if (oldRoomData && cr.isActive) {
                cr.isActive = false;

                const hist = booking.roomsHistory.find(h => h.roomNo === cr.roomNo && !h.isSwitched);
                if (hist) {
                    hist.switchOutDate = today;
                    hist.isSwitched = true;
                    hist.status = "switched_out";
                    hist.switchFrom = newRoomNumbers.join(", ");

                    // Optional: update discount if provided
                    if (oldRoomData.discountPrice != null) {
                        hist.discountPrice = oldRoomData.discountPrice;
                    }

                    // Ensure currency remains the same as currentRooms
                    hist.currency = cr.currency;
                }
            }
        });

        await Room.updateMany(
            { no: oldRooms.map(o => o.roomNo) },
            { $set: { isBooked: false } }
        );

        // 6️⃣ Process new rooms
        const newHistories = [];
        const newCurrentRooms = [];

        for (const nr of newRooms) {
            const r = roomMap[nr.roomNo];
            const perDayPrice = nr.perDayPrice != null ? nr.perDayPrice : r.perDayPrice; // fallback to room default
            const currency = nr.currency || r.currency;

            newHistories.push({
                roomId: r._id,
                roomNo: r.no,
                perDayPrice,
                currency,
                finalRoomTotalPrice: nr.finalRoomTotalPrice || null,
                discountPrice: nr.discountPrice || null,
                switchInDate: today,
                switchOutDate: booking.checkOut,
                isSwitched: false,
                status: "switched_in",
                switchFrom: oldRooms.map(o => o.roomNo).join(", "),
            });

            newCurrentRooms.push({
                roomId: r._id,
                roomNo: r.no,
                isActive: true,
                perDayPrice,
                currency,
            });
        }

        booking.currentRooms.push(...newCurrentRooms);
        booking.roomsHistory.push(...newHistories);

        await Room.updateMany(
            { no: newRoomNumbers },
            { $set: { isBooked: true } }
        );

        // 7️⃣ Regenerate QR
        const activeRooms = booking.currentRooms.filter(r => r.isActive).map(r => r.roomNo);
        const qr = await generateAndUploadQr({
            name: booking.guestName,
            roomNumbers: activeRooms,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            hotel: booking.hotel,
        });
        booking.qrPublicId = qr.publicId;
        booking.qrUrl = qr.url;

        await booking.save();

        // 8️⃣ Response
        return res.status(200).json({
            message: "Rooms switched successfully",
            bookingId: booking._id,
            currentRooms: activeRooms,
            qrUrl: booking.qrUrl,
        });

    } catch (err) {
        console.error("Switch rooms error:", err);
        return res.status(err.status || 500).json({ error: err.message || "Failed to switch rooms" });
    }
};



// Get all rooms for register guest
export const getAllRoomsWithBookingDetails = async (req, res) => {
    try {
        const rooms = await Room.find().lean();

        const enrichedRooms = await Promise.all(
            rooms.map(async (room) => {
                if (room.isBooked) {
                    const bookingId = await findActiveBookingByRoomNo(room.no);
                    const booking = await Booking.findById(bookingId);
                    if (booking) {
                        room.bookingId = booking._id;
                        room.guestName = booking.guestName;
                    } else {
                        room.bookingId = null;
                        room.guestName = null;
                    }
                }
                return room;
            })
        );

        return res.status(200).json({
            success: true,
            total: enrichedRooms.length,
            rooms: enrichedRooms
        });

    } catch (err) {
        console.error("Error fetching rooms:", err);
        return res.status(500).json({ error: "Failed to fetch rooms" });
    }
};

export const getAllReservedRoomsWithBookingDetails = async (req, res) => {
    try {
        const rooms = await Room.find({isBooked: true}).lean();

        const enrichedRooms = await Promise.all(
            rooms.map(async (room) => {
                if (room.isBooked) {
                    const bookingId = await findActiveBookingByRoomNo(room.no);
                    const booking = await Booking.findById(bookingId);
                    if (booking) {
                        room.bookingId = booking._id;
                        room.guestName = booking.guestName;
                    } else {
                        room.bookingId = null;
                        room.guestName = null;
                    }
                }
                return room;
            })
        );

        return res.status(200).json({
            success: true,
            total: enrichedRooms.length,
            rooms: enrichedRooms
        });

    } catch (err) {
        console.error("Error fetching rooms:", err);
        return res.status(500).json({ error: "Failed to fetch rooms" });
    }
};

export const sendEmailMessage = async (to, message, qrUrl) => {
    if (!to) throw new Error("Recipient email address is required.");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || "Hotel Booking"}" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your Booking Confirmation",
        text: message, // plain text fallback
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Booking Confirmation</h2>
        <p>${message.replace(/\n/g, "<br/>")}</p>
        ${
            qrUrl
                ? `<p><strong>Your Booking QR:</strong></p>
               <img src="${qrUrl}" alt="Booking QR" width="200" height="200" style="border:1px solid #ccc;"/>`
                : ""
        }
        <p style="margin-top:20px;">Thank you for booking with us!</p>
      </div>
    `,
        attachments: qrUrl
            ? [
                {
                    filename: "booking_qr.png",
                    path: qrUrl,
                },
            ]
            : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(" Email sent:", info.response);
    return info;
};

const HOTEL_TZ = "Asia/Colombo";

export const getTodayExtendedRooms = async (req, res) => {
    try {
        const startOfToday = dayjs().tz(HOTEL_TZ).startOf("day").toDate();
        const startOfTomorrow = dayjs(startOfToday).add(1, "day").toDate();

        const bookings = await Booking.find({
            isCheckOut: false,
            lastExtendedOn: { $gte: startOfToday, $lt: startOfTomorrow },
        })
            .select("guestName hotel currentRooms.roomNo lastExtendedOn checkOut")
            .lean();

        const rooms = bookings.flatMap((b) =>
            (b.currentRooms || [])
                .filter((r) => r.isActive)
                .map((r) => ({
                    bookingId: b._id,
                    roomNo: r.roomNo,
                    guestName: b.guestName,
                    hotel: b.hotel,
                    lastExtendedOn: b.lastExtendedOn,
                    checkOut: b.checkOut,
                }))
        );

        return res.status(200).json({ success: true, rooms });
    } catch (err) {
        console.error("getTodayExtendedRooms error:", err);
        return res.status(500).json({ error: "Failed to fetch extended rooms" });
    }
};


export const addOrderToBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId, date } = req.body;
    
    // Validate input
    if (!id) {
      return sendErrorResponse(res, 400, "Booking ID is required");
    }
    if (!orderId) {
      return sendErrorResponse(res, 400, "Order ID is required");
    }

    // Check if booking exists
    const booking = await Booking.findById(id);
    if (!booking) {
      return sendErrorResponse(res, 404, "Booking not found");
    }

    // Check if order already exists (avoid duplicates)
    const alreadyExists = booking.orders.some(
      (order) => order.oderId.toString() === orderId
    );

    if (alreadyExists) {
      return sendErrorResponse(res, 400, "This order is already added to the booking");
    }

    // Push the new order to the orders array
    booking.orders.push({
      oderId: orderId,
      date: date || new Date(),
    });

    // Save the updated booking
    await booking.save();

    return sendSuccessResponse(res, 200, "Order successfully added to booking", {
      id: booking._id,
      addedOrder: { orderId, date },
      totalOrders: booking.orders.length,
    });
  } catch (error) {
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};
//
// export const updateBooking = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const {
//             guestName,
//             country,
//             email,
//             whatsapp,
//             totalGuests,
//             kids,
//             adults,
//             checkOut,
//             updateUserId,
//             updatedRooms
//         } = req.body;
//         if (!updateUserId) {
//             return res.status(400).json({ error: "Unauthorized creation. ID is required." });
//         }
//
//         const user = await User.findById(updateUserId).lean();
//         if (!user) {
//             return res.status(404).json({ error: "User not found. Unauthorized creation." });
//         }
//
//         const updatedByName = user.name;
//
//         // ✅ Validate required update fields
//         if (!updateUserId ) {
//             return res.status(400).json({
//                 error: "updateUserId  are required."
//             });
//         }
//
//         const booking = await Booking.findById(id);
//         if (!booking) {
//             return res.status(404).json({ error: "Booking not found." });
//         }
//
//
//         // ✅ Update simple fields
//         if (guestName) booking.guestName = guestName.trim();
//         if (country) booking.country = country.trim();
//         if (email) booking.email = email.trim();
//         if (whatsapp) booking.whatsapp = whatsapp.trim();
//         if (totalGuests != null) booking.totalGuests = totalGuests;
//         if (kids != null) booking.kids = kids;
//         if (adults != null) booking.adults = adults;
//
//         if (updatedRooms && Array.isArray(updatedRooms) && updatedRooms.length > 0) {
//             for (const { roomNo, newPrice } of updatedRooms) {
//                 // Find room in history
//                 const roomHistory = booking.roomsHistory.find(r => r.roomNo === roomNo);
//                 if (!roomHistory) {
//                     return res.status(400).json({
//                         error: `Room with roomNo '${roomNo}' not found in booking history.`,
//                     });
//                 }
//
//                 // Add to perDayPriceHistory (create if missing)
//                 if (!roomHistory.perDayPriceHistory) {
//                     roomHistory.perDayPriceHistory = [];
//                 }
//                 roomHistory.perDayPriceHistory.push({
//                     price: newPrice,
//                     date: new Date(),
//                 });
//
//                 // Update the main perDayPrice
//                 roomHistory.perDayPrice = newPrice;
//
//                 // ✅ Update currentRooms as well
//                 const currentRoom = booking.currentRooms.find(r => r.roomNo === roomNo);
//                 if (currentRoom) {
//                     currentRoom.price = newPrice;
//                 }
//             }
//         }
//
//
// // ✅ Room price updates
//         if (updatedRooms && Array.isArray(updatedRooms) && updatedRooms.length > 0) {
//             for (const { roomNo, newPrice } of updatedRooms) {
//                 const roomHistory = booking.roomsHistory.find(r => r.roomNo === roomNo);
//                 if (!roomHistory) {
//                     return res.status(400).json({
//                         error: `Room with roomNo '${roomNo}' not found in booking history.`,
//                     });
//                 }
//
//                 // Maintain price history
//                 if (!roomHistory.perDayPriceHistory) {
//                     roomHistory.perDayPriceHistory = [];
//                 }
//
//                 roomHistory.perDayPriceHistory.push({
//                     price: newPrice,
//                     date: new Date(),
//                 });
//
//                 // Update current room and price
//                 roomHistory.perDayPrice = newPrice;
//                 const currentRoom = booking.currentRooms.find(r => r.roomNo === roomNo);
//                 if (currentRoom) currentRoom.price = newPrice;
//             }
//         }
//
// // ✅ Handle check-out date update (Sri Lankan local date logic)
//         if (checkOut && dayjs(checkOut).isValid()) {
//             const todaySL = dayjs().tz(TZ).startOf("day");
//
//             // 🕓 Parse incoming checkOut as local Sri Lankan date at START of day (consistent with createBooking)
//             const newCheckOutSL = dayjs.tz(checkOut, TZ).startOf("day");
//
//             // ❌ Prevent past dates
//             if (newCheckOutSL.isBefore(todaySL, "day")) {
//                 return res.status(400).json({
//                     error: "Check-out date cannot be before today's Sri Lankan date.",
//                 });
//             }
//
//             const oldCheckOutSL = dayjs(booking.checkOut).tz(TZ).startOf("day");
//             const isCheckOutChanged = !newCheckOutSL.isSame(oldCheckOutSL, "day");
//
//             if (isCheckOutChanged) {
//                 booking.oldCheckOutDate = booking.checkOut; // keep old
//
//                 // ✅ Save as Date object (consistent with createBooking)
//                 booking.checkOut = newCheckOutSL.toDate();
//
//                 // ✅ Recalculate length of stay (inclusive nights)
//                 const checkInSL = dayjs(booking.checkIn).tz(TZ).startOf("day");
//                 const newLength = newCheckOutSL.diff(checkInSL, "day");
//                 booking.oldLengthOfStay = booking.lengthOfStay;
//                 booking.lengthOfStay = Math.max(newLength, 1);
//
//                 // ✅ Update room histories
//                 booking.roomsHistory.forEach(r => {
//                     r.switchOutDate = newCheckOutSL.toDate();
//                     r.night = booking.lengthOfStay;
//                     r.finalRoomTotalPrice = r.perDayPrice * booking.lengthOfStay;
//                 });
//             }
//         }
//
//
//
//         // ✅ Log update
//         booking.updatesHistory.push({
//             updateUserId,
//             updatedByName,
//             updateDate: new Date(),
//         });
//
//         await booking.save();
//
//         return res.status(200).json({
//             message: "Booking updated successfully.",
//             booking,
//         });
//     } catch (err) {
//         console.error("[UpdateBooking Error]", err);
//         return res.status(500).json({ error: "Internal server error." });
//     }
// };

export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            guestName,
            country,
            email,
            whatsapp,
            totalGuests,
            kids,
            adults,
            checkOut,
            updatedRooms
        } = req.body;

        const updateUserId = req.user?.userId || req.user?._id;

        if (!updateUserId) {
            return res.status(400).json({ error: "Unauthorized creation. ID is required." });
        }

        const user = await User.findById(updateUserId).lean();
        if (!user) {
            return res.status(404).json({ error: "User not found. Unauthorized creation." });
        }

        const updatedByName = user.name;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }
        if(booking.isCheckOut){
            return res.status(404).json({ error: "Booking is already checkout." });
        }

        // ✅ Update simple fields
        if (guestName) booking.guestName = guestName.trim();
        if (country) booking.country = country.trim();
        if (email) booking.email = email.trim();
        if (whatsapp) booking.whatsapp = whatsapp.trim();
        if (totalGuests != null) booking.totalGuests = totalGuests;
        if (kids != null) booking.kids = kids;
        if (adults != null) booking.adults = adults;

        // ✅ Room price updates
        if (updatedRooms && Array.isArray(updatedRooms) && updatedRooms.length > 0) {
            for (const { roomNo, newPrice, currency } of updatedRooms) {
                const roomHistory = booking.roomsHistory.find(r => r.roomNo === roomNo);
                if (!roomHistory) {
                    return res.status(400).json({
                        error: `Room with roomNo '${roomNo}' not found in booking history.`,
                    });
                }

                // Maintain price history
                if (!roomHistory.perDayPriceHistory) {
                    roomHistory.perDayPriceHistory = [];
                }

                roomHistory.perDayPriceHistory.push({
                    price: newPrice,
                    currency: currency ?? roomHistory.currency ?? "LKR", // 💰 save currency
                    date: new Date(),
                });

                // Update current room and price
                roomHistory.perDayPrice = newPrice;
                roomHistory.currency = currency ?? roomHistory.currency ?? "LKR";
                const currentRoom = booking.currentRooms.find(r => r.roomNo === roomNo);
                if (currentRoom) {
                    currentRoom.price = newPrice;
                    currentRoom.currency = currency ?? currentRoom.currency ?? "LKR";
                }
            }
        }

        // ✅ FIXED: Handle check-out date with CONSISTENT time handling
        if (checkOut) {
            console.log("Received checkOut:", checkOut, "Type:", typeof checkOut);

            let newCheckOutDate;

            if (typeof checkOut === 'string') {
                if (checkOut.includes('T') && checkOut.endsWith('Z')) {
                    // UTC ISO string: "2025-12-26T00:00:00.000Z"
                    // Use the exact UTC time provided
                    newCheckOutDate = new Date(checkOut);
                    console.log("Using exact UTC date:", newCheckOutDate.toISOString());
                } else if (checkOut.includes('/')) {
                    // Date with slashes: "12/01" or "11/30"
                    const currentYear = dayjs().year();
                    const [month, day] = checkOut.split('/');
                    const formattedDate = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    // Create date with same time as existing checkOut for consistency
                    const existingCheckOutTime = dayjs(booking.checkOut).format('HH:mm:ss');
                    newCheckOutDate = new Date(`${formattedDate}T${existingCheckOutTime}Z`);
                } else if (checkOut.includes('-')) {
                    // Standard date format: "2025-11-20"
                    // Create date with same time as existing checkOut for consistency
                    const existingCheckOutTime = dayjs(booking.checkOut).format('HH:mm:ss');
                    newCheckOutDate = new Date(`${checkOut}T${existingCheckOutTime}Z`);
                } else {
                    return res.status(400).json({
                        error: "Invalid date format. Use YYYY-MM-DD, MM/DD, or ISO date string."
                    });
                }
            } else {
                return res.status(400).json({
                    error: "checkOut must be a string."
                });
            }

            // For validation, convert to Sri Lanka timezone
            const newCheckOutSL = dayjs(newCheckOutDate).tz(TZ);
            const todaySL = dayjs().tz(TZ).startOf("day");
            const checkInSL = dayjs(booking.checkIn).tz(TZ).startOf("day");

            console.log("Validation dates - Today:", todaySL.format(), "Check-in:", checkInSL.format(), "New Check-out:", newCheckOutSL.format());
            console.log("Stored UTC date:", newCheckOutDate.toISOString());

            // Validate the parsed date
            if (!newCheckOutSL.isValid()) {
                return res.status(400).json({
                    error: "Invalid checkOut date. Please check the format."
                });
            }

            // ❌ Prevent past dates (before today)
            if (newCheckOutSL.isBefore(todaySL, "day")) {
                return res.status(400).json({
                    error: "Check-out date cannot be before today's Sri Lankan date.",
                });
            }

// ✅ Allow check-out on the same day as check-in, only prevent before check-in
            if (newCheckOutSL.isBefore(checkInSL, "day")) {
                return res.status(400).json({
                    error: "Check-out date must be on or after check-in date.",
                });
            }

            // Compare with existing checkOut date
            const oldCheckOutSL = dayjs(booking.checkOut).tz(TZ).startOf("day");
            const isCheckOutChanged = !newCheckOutSL.isSame(oldCheckOutSL, "day");

            if (isCheckOutChanged) {
                booking.oldCheckOutDate = booking.checkOut; // keep old

                // ✅ Store the new date
                booking.checkOut = newCheckOutDate;

                // ✅ Recalculate length of stay (inclusive nights)
                const newLength = newCheckOutSL.diff(checkInSL, "day");
                booking.oldLengthOfStay = booking.lengthOfStay;
                booking.lengthOfStay = Math.max(newLength, 1);

                // ✅ Update room histories with same date
                booking.roomsHistory.forEach(r => {
                    r.switchOutDate = newCheckOutDate;
                    r.night = booking.lengthOfStay;
                    r.finalRoomTotalPrice = r.perDayPrice * booking.lengthOfStay;
                });

                console.log("Final stored checkOut UTC:", booking.checkOut.toISOString());
                console.log("Final stored checkOut SL:", dayjs(booking.checkOut).tz(TZ).format());
            }
        }

        // ✅ Log update
        booking.updatesHistory.push({
            updateUserId,
            updatedByName,
            updateDate: new Date(),
        });

        await booking.save();

        return res.status(200).json({
            message: "Booking updated successfully.",
            booking,
        });
    } catch (err) {
        console.error("[UpdateBooking Error]", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

export const searchBookings = async (req, res) => {
    const { uniqueBookingId, rooms, guestName } = req.body;

    let results = [];

    // 1️⃣ If any filters are given, handle them separately
    if (uniqueBookingId || (rooms && rooms.length > 0) || guestName) {
        const queries = [];

        if (uniqueBookingId && uniqueBookingId.trim() !== "") {
            queries.push(
                Booking.find({
                    uniqueBookingId: { $regex: uniqueBookingId.trim(), $options: "i" },
                }).select({
                    _id: 1,
                    uniqueBookingId: 1,
                    guestName: 1,
                    totalGuests: 1,
                    isCheckOut: 1,
                    "currentRooms.roomNo": 1,
                })
            );
        }

        if (rooms && rooms.length > 0) {
            const roomList = Array.isArray(rooms) ? rooms : [rooms];
            queries.push(
                Booking.find({
                    "currentRooms.roomNo": { $in: roomList },
                }).select({
                    _id: 1,
                    uniqueBookingId: 1,
                    guestName: 1,
                    totalGuests: 1,
                    isCheckOut: 1,
                    "currentRooms.roomNo": 1,
                })
            );
        }

        if (guestName && guestName.trim() !== "") {
            queries.push(
                Booking.find({
                    guestName: { $regex: guestName.trim(), $options: "i" },
                }).select({
                    _id: 1,
                    uniqueBookingId: 1,
                    guestName: 1,
                    totalGuests: 1,
                    isCheckOut: 1,
                    "currentRooms.roomNo": 1,
                })
            );
        }

        // Run all queries in parallel
        const queryResults = await Promise.all(queries);

        // Merge all results & remove duplicates by _id
        const merged = queryResults.flat();
        const uniqueBookings = Array.from(
            new Map(merged.map((b) => [b._id.toString(), b])).values()
        );

        results = uniqueBookings;
    } else {
        // 2️⃣ No filters — get all bookings
        results = await Booking.find().select({
            _id: 1,
            uniqueBookingId: 1,
            guestName: 1,
            totalGuests: 1,
            isCheckOut: 1,
            "currentRooms.roomNo": 1,
        });
    }

    // Format results
    const formattedResults = results.map((b) => ({
        id: b._id,
        bookingId: b.uniqueBookingId,
        guestName: b.guestName,
        totalGuests: b.totalGuests,
        isCheckOut: b.isCheckOut,
        rooms: b.currentRooms.map((r) => r.roomNo),
    }));

    res.status(200).json({
        success: true,
        count: formattedResults.length,
        data: formattedResults,
    });
};

// Get booking by ID
export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid booking ID." });
        }

        // Find booking and populate related fields
        const booking = await Booking.findById(id)
            .populate("createdById", "name email") // shows basic user info
            .populate("checkOutById", "name email")
            .populate("currentRooms.roomId", "no type perDayPrice facilities")
            .populate("roomsHistory.roomId", "no type perDayPrice")
            .populate("orders.oderId"); // optional, show linked orders

        // If not found
        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }

        // Success response
        res.status(200).json({
            message: "Booking retrieved successfully.",
            booking,
        });

    } catch (error) {
        console.error("Error fetching booking by ID:", error);
        res.status(500).json({ error: "Server error while fetching booking." });
    }
};

// export const getAllActiveBookings = async (req, res) => {
//     try {
//         const bookings = await Booking.find({ isCheckOut: false })
//             .populate("currentRooms.roomId", "no perDayPrice facilities isBooked") // populate room details
//             .populate("roomsHistory.roomId", "no perDayPrice") // include room info in history
//             .populate("updatesHistory.updateUserId", "fullName email") // include who updated
//             .populate("orders.oderId") // populate linked orders
//             .sort({ createdAt: -1 }) // latest first
//             .lean();
//
//         if (!bookings.length) {
//             return res.status(404).json({ message: "No active bookings found." });
//         }
//
//         return res.status(200).json({
//             count: bookings.length,
//             bookings,
//         });
//     } catch (error) {
//         console.error("Error fetching active bookings:", error);
//         return res.status(500).json({ message: "Failed to fetch active bookings." });
//     }
// };

export const getAllActiveBookings = async (req, res) => {
    try {
        const { searchTerm, page = 1, limit = 10 } = req.body;

        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const skip = (pageNumber - 1) * pageSize;

        let bookings = [];

        // 1️⃣ If searchTerm is provided → search separately
        if (searchTerm && searchTerm.trim() !== "") {
            const searchRegex = new RegExp(searchTerm.trim(), "i");

            const searchResults = [];

            // Search 1: by uniqueBookingId
            const byBookingId = await Booking.find({
                isCheckOut: false,
                uniqueBookingId: { $regex: searchRegex },
            })
                .populate("currentRooms.roomId", "no perDayPrice facilities isBooked")
                .populate("roomsHistory.roomId", "no perDayPrice")
                .populate("updatesHistory.updateUserId", "fullName email")
                .populate("orders.oderId")
                .lean();
            searchResults.push(...byBookingId);

            // Search 2: by roomNo
            const byRoom = await Booking.find({
                isCheckOut: false,
                "currentRooms.roomNo": { $regex: searchRegex },
            })
                .populate("currentRooms.roomId", "no perDayPrice facilities isBooked")
                .populate("roomsHistory.roomId", "no perDayPrice")
                .populate("updatesHistory.updateUserId", "fullName email")
                .populate("orders.oderId")
                .lean();
            searchResults.push(...byRoom);

            // Search 3: by guestName
            const byGuestName = await Booking.find({
                isCheckOut: false,
                guestName: { $regex: searchRegex },
            })
                .populate("currentRooms.roomId", "no perDayPrice facilities isBooked")
                .populate("roomsHistory.roomId", "no perDayPrice")
                .populate("updatesHistory.updateUserId", "fullName email")
                .populate("orders.oderId")
                .lean();
            searchResults.push(...byGuestName);

            // Remove duplicates
            const uniqueBookings = Array.from(
                new Map(searchResults.map((b) => [b._id.toString(), b])).values()
            );

            // Sort by newest
            bookings = uniqueBookings.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            // Pagination slice
            const paginated = bookings.slice(skip, skip + pageSize);

            return res.status(200).json({
                count: bookings.length,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(bookings.length / pageSize),
                bookings: paginated,
            });

        } else {
            // 2️⃣ No search → simple find with pagination
            const total = await Booking.countDocuments({ isCheckOut: false });

            const records = await Booking.find({ isCheckOut: false })
                .populate("currentRooms.roomId", "no perDayPrice facilities isBooked")
                .populate("roomsHistory.roomId", "no perDayPrice")
                .populate("updatesHistory.updateUserId", "fullName email")
                .populate("orders.oderId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean();

            return res.status(200).json({
                count: total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
                bookings: records,
            });
        }

    } catch (error) {
        console.error("Error fetching active bookings:", error);
        return res.status(500).json({ message: "Failed to fetch active bookings." });
    }
};
export const getCompletedBookings = async (req, res) => {
    try {
        const bookings = await Booking.find(
            { isCheckOut: true },
            {
                _id: 1,
                uniqueBookingId: 1,
                totalBill: 1,
                guestName: 1,
                totalGuests: 1,
                checkIn: 1,
                checkOut: 1,
                "currentRooms.roomNo": 1 // return only roomNo from currentRooms array
            }
        );

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};


export const getBookingByIdIfCheckedOut = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findOne({
            _id: id,
            isCheckOut: true
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "No checked-out booking found with this ID"
            });
        }

        return res.status(200).json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error("Error retrieving booking:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};
