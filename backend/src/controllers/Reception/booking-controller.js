// import mongoose from "mongoose";
// import Booking from "../../models/Reception/Booking.js";
// import Room from "../../models/Room.js";
// import {generateAndUploadQr} from "../../utils/qr.js";
// import {sendWhatsAppMessage} from "../../utils/sendWhatsAppMessage.js";
// import {findActiveBookingByRoomNo} from "../../utils/findActiveBookingByRoomNo.js";

// // Function to validate incoming body data
// function validateCreateBookingBody(body) {
//     const required = [
//         "guestName", "country", "totalGuests", "lengthOfStay", "checkIn", "checkOut", "hotel", "currentRooms"
//     ];

//     const missing = required.filter((k) => body[k] === undefined || body[k] === null);
//     if (missing.length) {
//         const err = new Error(`Missing required fields: ${missing.join(", ")}`);
//         err.status = 400;
//         throw err;
//     }

//     if (!Array.isArray(body.currentRooms) || body.currentRooms.length === 0) {
//         const err = new Error("currentRooms must be a non-empty array of room numbers.");
//         err.status = 400;
//         throw err;
//     }
// }

// // Controller to create a booking
// export const createBooking = async (req, res) => {
//     try {
//         // Validate incoming data
//         validateCreateBookingBody(req.body);

//         // Extract data from the request body
//         const {
//             guestName, country, passportId, totalGuests, lengthOfStay, email, whatsapp,
//             checkIn, checkOut, hotel, currentRooms, payload, adults, kids,
//         } = req.body;

//         const trimmedGuestName = guestName.trim();
//         const trimmedCountry = country.trim();
//         const trimmedEmail = email ? email.trim() : undefined;
//         const trimmedWhatsapp = whatsapp ? whatsapp.trim() : undefined;
//         const trimmedPassportId = passportId ? passportId.trim() : undefined;
//         const trimmedHotel = hotel.trim();

//         // Normalize currentRooms (support string[] or {roomNo}[])
//         const normalizedRooms = currentRooms.map(r =>
//             typeof r === "string" ? { roomNo: r } : r
//         );

//         // Fetch room details
//         const rooms = await Room.find({
//             no: { $in: normalizedRooms.map(room => room.roomNo) },
//             isBooked: false,
//         }).lean();

//         if (rooms.length !== normalizedRooms.length) {
//             return res.status(400).json({
//                 error: "Some rooms are already booked or not found.",
//             });
//         }

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

//         // Start a session
//         const session = await mongoose.startSession();
//         let newBooking;

//         try {
//             await session.withTransaction(async () => {
//                 // Mark rooms as booked
//                 const { modifiedCount } = await Room.updateMany(
//                     { no: { $in: normalizedRooms.map(room => room.roomNo) }, isBooked: false },
//                     { $set: { isBooked: true } },
//                     { session }
//                 );

//                 if (modifiedCount !== normalizedRooms.length) {
//                     throw Object.assign(new Error("One or more rooms are unavailable."), { status: 409 });
//                 }

//                 // Create booking
//                 newBooking = await Booking.create(
//                     [
//                         {
//                             guestName: trimmedGuestName,
//                             country: trimmedCountry,
//                             passportId: trimmedPassportId,
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
//                                 isActive: true,
//                             })),
//                             payload,
//                             qrPublicId: qr.publicId,
//                             qrUrl: qr.url,
//                             bookingDate: new Date(),
//                             isCheckOut: false,
//                         },
//                     ],
//                     { session }
//                 );

//                 // Add room history for all booked rooms
//                 for (const room of rooms) {
//                     newBooking[0].roomsHistory.push({
//                         roomId: room._id,
//                         roomNo: room.no,
//                         perDayPrice: room.perDayPrice,
//                         roomTotalPrice: room.perDayPrice * lengthOfStay,
//                         switchInDate: checkIn,
//                         switchOutDate: checkOut, // planned checkout
//                         isSwitched: false,
//                         status: 'active',
//                     });
//                 };

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

//         return res.status(201).json({ bookingId: newBooking?.[0]._id });
//     } catch (err) {
//         const status = err.status || 500;
//         return res.status(status).json({
//             error: status === 400 ? err.message : "Internal server error",
//         });
//     }
// };

// export const sendBookingQrViaWhatsApp = async (req, res) => {
//     const { id } = req.params;
//     const { message } = req.body;

//     try {
//         const booking = await Booking.findById(id).lean();
//         if (!booking) {
//             return res.status(404).json({ error: "Booking not found" });
//         }

//         if (!booking.whatsapp) {
//             return res.status(400).json({ error: "Booking does not have WhatsApp number" });
//         }

//         const defaultMessage = `Hello ${booking.guestName}, your booking is confirmed!
//             Booking ID: ${booking._id}
//             Hotel: ${booking.hotel}
//             Total: $${booking.totalPrice}
//             Check-in: ${new Date(booking.checkIn).toDateString()}
//             Check-out: ${new Date(booking.checkOut).toDateString()}
//             QR attached for your booking.`;

//         const finalMessage = message || defaultMessage;

//         const whatsappLink = await sendWhatsAppMessage(booking.whatsapp, finalMessage, booking.qrUrl);

//         return res.status(200).json({
//             success: true,
//             message: "WhatsApp link generated successfully",
//             whatsappLink
//         });

//     } catch (err) {
//         return res.status(500).json({ error: "Failed to generate WhatsApp link" });
//     }
// };

// // Get All room details for particular booking
// export const getBookingWithActiveRoomsAndPrices = async (req, res) => {
//     try {
//         const { roomNo } = req.params;

//         const bookingId = await findActiveBookingByRoomNo(roomNo);

//         if (!bookingId) {
//             return res.status(404).json({ message: "No active booking found for this room." });
//         }

//         // Fetch booking details
//         const booking = await Booking.findById(bookingId)
//             .populate("currentRooms.roomId")
//             .populate("roomsHistory.roomId");

//         if (!booking) {
//             return res.status(404).json({ message: "Booking not found." });
//         }

//         //  Extract ALL active rooms
//         const activeRooms = booking.currentRooms.filter(room => room.isActive);

//         // Build details for each active room
//         const activeRoomDetails = activeRooms.map(activeRoom => {
//             // Find history entry where isSwitched = false for this room
//             const historyEntry = booking.roomsHistory.find(
//                 h => h.roomNo === activeRoom.roomNo && h.isSwitched === false
//             );

//             let perDayPrice = historyEntry ? historyEntry.perDayPrice : activeRoom.roomId.perDayPrice;
//             let switchInDate = historyEntry ? historyEntry.switchInDate : booking.checkIn;
//             let switchOutDate = historyEntry && historyEntry.switchOutDate ? historyEntry.switchOutDate : booking.checkOut;

//             // Calculate total days (inclusive of switchInDate, exclusive of switchOutDate)
//             const diffTime = new Date(switchOutDate) - new Date(switchInDate);
//             const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convert ms -> days

//             const roomTotalPrice = perDayPrice * days;

//             return {
//                 roomNo: activeRoom.roomNo,
//                 type: activeRoom.roomId.type,
//                 facilities: activeRoom.roomId.facilities,
//                 perDayPrice,
//                 switchInDate,
//                 switchOutDate,
//                 roomTotalPrice
//             };
//         });

//         const responseData = {
//             bookingId: booking._id,
//             guestName: booking.guestName,
//             checkIn: booking.checkIn,
//             checkOut: booking.checkOut,
//             activeRooms: activeRoomDetails
//         };

//         return res.status(200).json(responseData);

//     } catch (error) {
//         console.error("Error fetching booking with active rooms and prices:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// // Switch rooms with proper isSwitched status
// export const switchRoomsBulk = async (req, res) => {
//     const { bookingId } = req.params;
//     const { oldRooms, newRooms } = req.body;

//     if (!Array.isArray(oldRooms) || !Array.isArray(newRooms)) {
//         return res.status(400).json({ error: "oldRooms and newRooms must be arrays" });
//     }

//     const today = new Date();

//     try {
//         // Fetch booking
//         const booking = await Booking.findById(bookingId);
//         if (!booking) throw Object.assign(new Error("Booking not found"), { status: 404 });

//         // Fetch all old and new rooms in one query
//         const allRoomNumbers = [...oldRooms.map(r => r.roomNo), ...newRooms];
//         const rooms = await Room.find({ no: { $in: allRoomNumbers } });
//         const roomMap = Object.fromEntries(rooms.map(r => [r.no, r]));

//         // Validate rooms
//         oldRooms.forEach(o => {
//             if (!booking.currentRooms.some(r => r.roomNo === o.roomNo && r.isActive)) {
//                 throw Object.assign(new Error(`Old room ${o.roomNo} not found or inactive`), { status: 400 });
//             }
//             if (!roomMap[o.roomNo]) throw Object.assign(new Error(`Old room ${o.roomNo} not found`), { status: 400 });
//         });

//         newRooms.forEach(no => {
//             if (!roomMap[no]) throw Object.assign(new Error(`New room ${no} not found`), { status: 400 });
//             if (roomMap[no].isBooked) throw Object.assign(new Error(`New room ${no} is already booked`), { status: 400 });
//         });

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

//         //  Update old rooms in Room model in bulk
//         await Room.updateMany(
//             { no: { $in: oldRoomNumbers } },
//             { $set: { isBooked: false } }
//         );

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

//         booking.currentRooms.push(...newCurrentRooms);
//         booking.roomsHistory.push(...newHistories);

//         // Update new rooms in Room model in bulk
//         await Room.updateMany(
//             { no: newRooms },
//             { $set: { isBooked: true } }
//         );

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

//         // 9. Save booking
//         await booking.save();

//         return res.status(200).json({
//             message: "Rooms switched successfully",
//             bookingId: booking._id,
//             currentRooms: activeRooms,
//             qrUrl: booking.qrUrl
//         });

//     } catch (err) {
//         console.error("Switch rooms error:", err);
//         return res.status(err.status || 500).json({ error: err.message || "Failed to switch rooms" });
//     }
// };

// // export const switchRoomsBulk = async (req, res) => {
// //     const { bookingId } = req.params;
// //     const { oldRooms, newRooms } = req.body;
// //
// //     if (!Array.isArray(oldRooms) || !Array.isArray(newRooms)) {
// //         return res.status(400).json({ error: "oldRooms and newRooms must be arrays" });
// //     }
// //
// //     const session = await mongoose.startSession();
// //     const today = new Date();
// //
// //     try {
// //         let booking;
// //         await session.withTransaction(async () => {
// //             // 1. Fetch booking
// //             booking = await Booking.findById(bookingId).session(session);
// //             if (!booking) throw Object.assign(new Error("Booking not found"), { status: 404 });
// //
// //             // 2. Fetch all old rooms and new rooms in one query
// //             const roomNumbers = [...oldRooms, ...newRooms];
// //             const rooms = await Room.find({ no: { $in: roomNumbers } }).session(session);
// //             const roomMap = Object.fromEntries(rooms.map(r => [r.no, r]));
// //
// //             // 3. Validate all rooms exist and availability
// //             for (const oldRoomNo of oldRooms) {
// //                 if (!booking.currentRooms.find(r => r.roomNo === oldRoomNo && r.isActive)) {
// //                     throw Object.assign(new Error(`Old room ${oldRoomNo} not found or inactive`), { status: 400 });
// //                 }
// //                 if (!roomMap[oldRoomNo]) throw Object.assign(new Error(`Room ${oldRoomNo} not found`), { status: 400 });
// //             }
// //             for (const newRoomNo of newRooms) {
// //                 const newRoom = roomMap[newRoomNo];
// //                 if (!newRoom) throw Object.assign(new Error(`New room ${newRoomNo} not found`), { status: 400 });
// //                 if (newRoom.isBooked) throw Object.assign(new Error(`New room ${newRoomNo} is already booked`), { status: 400 });
// //             }
// //
// //             // 4. Update old rooms in memory
// //             const oldRoomHistories = [];
// //             booking.currentRooms = booking.currentRooms.map(r => {
// //                 if (oldRooms.includes(r.roomNo) && r.isActive) {
// //                     // Update room as inactive
// //                     r.isActive = false;
// //
// //                     // Find history and update
// //                     const hist = booking.roomsHistory.find(h => h.roomNo === r.roomNo && !h.isSwitched);
// //                     if (hist) {
// //                         hist.switchOutDate = today;
// //                         hist.isSwitched = true;
// //                         hist.status = "switched_out";
// //                         hist.switchFrom = newRooms.join(", ");
// //                         oldRoomHistories.push(hist);
// //                     }
// //                 }
// //                 return r;
// //             });
// //
// //             // 5. Update Room models in bulk (old rooms set isBooked=false)
// //             await Room.updateMany({ no: { $in: oldRooms } }, { $set: { isBooked: false } }, { session });
// //
// //             // 6. Add new rooms to booking and history
// //             const newHistories = [];
// //             const newCurrentRooms = newRooms.map(no => {
// //                 const r = roomMap[no];
// //                 // Update Room model as booked
// //                 r.isBooked = true;
// //                 newHistories.push({
// //                     roomId: r._id,
// //                     roomNo: r.no,
// //                     perDayPrice: r.perDayPrice,
// //                     finalRoomTotalPrice: null,
// //                     discountPrice: null,
// //                     switchInDate: today,
// //                     switchOutDate: booking.checkOut,
// //                     isSwitched: false,
// //                     status: "switched_in",
// //                     switchFrom: oldRooms.join(", "),
// //                 });
// //                 return {
// //                     roomId: r._id,
// //                     roomNo: r.no,
// //                     isActive: true,
// //                 };
// //             });
// //
// //             booking.currentRooms.push(...newCurrentRooms);
// //             booking.roomsHistory.push(...newHistories);
// //
// //             // 7. Update new rooms in Room model in bulk
// //             await Room.updateMany({ no: { $in: newRooms } }, { $set: { isBooked: true } }, { session });
// //
// //             // 8. Regenerate QR
// //             const activeRooms = booking.currentRooms.filter(r => r.isActive).map(r => r.roomNo);
// //             const qr = await generateAndUploadQr({
// //                 name: booking.guestName,
// //                 roomNumbers: activeRooms,
// //                 checkIn: booking.checkIn,
// //                 checkOut: booking.checkOut,
// //                 hotel: booking.hotel,
// //             });
// //             booking.qrPublicId = qr.publicId;
// //             booking.qrUrl = qr.url;
// //
// //             await booking.save({ session });
// //         });
// //
// //         return res.status(200).json({
// //             message: "Rooms switched successfully",
// //             bookingId: booking._id,
// //             currentRooms: booking.currentRooms.filter(r => r.isActive).map(r => r.roomNo),
// //             qrUrl: booking.qrUrl
// //         });
// //
// //     } catch (err) {
// //         console.error("Switch rooms error:", err);
// //         return res.status(err.status || 500).json({ error: err.message || "Failed to switch rooms" });
// //     } finally {
// //         session.endSession();
// //     }
// // };

// // Get all rooms for register guest
// export const getAllRoomsWithBookingDetails = async (req, res) => {
//     try {
//         const rooms = await Room.find().lean();

//         const enrichedRooms = await Promise.all(
//             rooms.map(async (room) => {
//                 if (room.isBooked) {
//                     const booking = await findActiveBookingByRoomNo(room._id);
//                     if (booking) {
//                         room.bookingId = booking._id;
//                         room.guestName = booking.guestName;
//                     } else {
//                         room.bookingId = null;
//                         room.guestName = null;
//                     }
//                 }
//                 return room;
//             })
//         );

//         return res.status(200).json({
//             success: true,
//             total: enrichedRooms.length,
//             rooms: enrichedRooms
//         });

//     } catch (err) {
//         console.error("Error fetching rooms:", err);
//         return res.status(500).json({ error: "Failed to fetch rooms" });
//     }
// };




import mongoose from "mongoose";
import Booking from "../../models/Reception/booking.js";
import Room from "../../models/Room.js";
import {generateAndUploadQr} from "../../utils/qr.js";
import {sendWhatsAppMessage} from "../../utils/sendWhatsAppMessage.js";
import {findActiveBookingByRoomNo} from "../../utils/findActiveBookingByRoomNo.js";

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

// Controller to create a booking
export const createBooking = async (req, res) => {
    try {
        // Validate incoming data
        validateCreateBookingBody(req.body);

        // Extract data from the request body
        const {
            guestName, country, passportId, totalGuests, lengthOfStay, email, whatsapp,
            checkIn, checkOut, hotel, currentRooms, payload, adults, kids,
        } = req.body;

        const trimmedGuestName = guestName.trim();
        const trimmedCountry = country.trim();
        const trimmedEmail = email ? email.trim() : undefined;
        const trimmedWhatsapp = whatsapp ? whatsapp.trim() : undefined;
        const trimmedPassportId = passportId ? passportId.trim() : undefined;
        const trimmedHotel = hotel.trim();

        // Normalize currentRooms (support string[] or {roomNo}[])
        const normalizedRooms = currentRooms.map(r =>
            typeof r === "string" ? { roomNo: r } : r
        );

        // Fetch room details
        const rooms = await Room.find({
            no: { $in: normalizedRooms.map(room => room.roomNo) },
            isBooked: false,
        }).lean();

        if (rooms.length !== normalizedRooms.length) {
            return res.status(400).json({
                error: "Some rooms are already booked or not found.",
            });
        }

        // Create QR code
        let qr;
        try {
            qr = await generateAndUploadQr({
                name: trimmedGuestName,
                roomNumbers: normalizedRooms.map(room => room.roomNo),
                checkIn,
                checkOut,
                hotel: trimmedHotel,
            });
        } catch (qrErr) {
            console.error("[QR] generation/upload failed:", qrErr);
            return res.status(500).json({ error: "Failed to generate booking QR." });
        }

        // Start a session
        const session = await mongoose.startSession();
        let newBooking;

        try {
            await session.withTransaction(async () => {
                // Mark rooms as booked
                const { modifiedCount } = await Room.updateMany(
                    { no: { $in: normalizedRooms.map(room => room.roomNo) }, isBooked: false },
                    { $set: { isBooked: true } },
                    { session }
                );

                if (modifiedCount !== normalizedRooms.length) {
                    throw Object.assign(new Error("One or more rooms are unavailable."), { status: 409 });
                }

                // Create booking
                newBooking = await Booking.create(
                    [
                        {
                            guestName: trimmedGuestName,
                            country: trimmedCountry,
                            passportId: trimmedPassportId,
                            totalGuests,
                            lengthOfStay,
                            checkIn,
                            checkOut,
                            hotel: trimmedHotel,
                            whatsapp: trimmedWhatsapp,
                            email: trimmedEmail,
                            adults,
                            kids,
                            currentRooms: normalizedRooms.map(room => ({
                                roomId: rooms.find(r => r.no === room.roomNo)._id,
                                roomNo: room.roomNo,
                                isActive: true,
                            })),
                            payload,
                            qrPublicId: qr.publicId,
                            qrUrl: qr.url,
                            bookingDate: new Date(),
                            isCheckOut: false,
                        },
                    ],
                    { session }
                );

                // Add room history for all booked rooms
                for (const room of rooms) {
                    newBooking[0].roomsHistory.push({
                        roomId: room._id,
                        roomNo: room.no,
                        perDayPrice: room.perDayPrice,
                        roomTotalPrice: room.perDayPrice * lengthOfStay,
                        switchInDate: checkIn,
                        switchOutDate: checkOut, // planned checkout
                        isSwitched: false,
                        status: 'active',
                    });
                };

                await newBooking[0].save({ session });
            });
        } catch (txnErr) {
            console.log(txnErr)
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
        const status = err.status || 500;
        return res.status(status).json({
            error: status === 400 ? err.message : "Internal server error",
        });
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
                roomTotalPrice
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

// Switch rooms with proper isSwitched status
export const switchRoomsBulk = async (req, res) => {
    const { bookingId } = req.params;
    const { oldRooms, newRooms } = req.body;

    if (!Array.isArray(oldRooms) || !Array.isArray(newRooms)) {
        return res.status(400).json({ error: "oldRooms and newRooms must be arrays" });
    }

    const today = new Date();

    try {
        // Fetch booking
        const booking = await Booking.findById(bookingId);
        if (!booking) throw Object.assign(new Error("Booking not found"), { status: 404 });

        // Fetch all old and new rooms in one query
        const allRoomNumbers = [...oldRooms.map(r => r.roomNo), ...newRooms];
        const rooms = await Room.find({ no: { $in: allRoomNumbers } });
        const roomMap = Object.fromEntries(rooms.map(r => [r.no, r]));

        // Validate rooms
        oldRooms.forEach(o => {
            if (!booking.currentRooms.some(r => r.roomNo === o.roomNo && r.isActive)) {
                throw Object.assign(new Error(`Old room ${o.roomNo} not found or inactive`), { status: 400 });
            }
            if (!roomMap[o.roomNo]) throw Object.assign(new Error(`Old room ${o.roomNo} not found`), { status: 400 });
        });

        newRooms.forEach(no => {
            if (!roomMap[no]) throw Object.assign(new Error(`New room ${no} not found`), { status: 400 });
            if (roomMap[no].isBooked) throw Object.assign(new Error(`New room ${no} is already booked`), { status: 400 });
        });

        // Process old rooms in memory and mark as inactive
        const oldRoomNumbers = oldRooms.map(r => r.roomNo);
        booking.currentRooms.forEach(r => {
            const oldData = oldRooms.find(o => o.roomNo === r.roomNo);
            if (oldData && r.isActive) {
                r.isActive = false;
                const hist = booking.roomsHistory.find(h => h.roomNo === r.roomNo && !h.isSwitched);
                if (hist) {
                    hist.switchOutDate = today;
                    hist.isSwitched = true;
                    hist.status = "switched_out";
                    hist.switchFrom = newRooms.join(", ");
                    hist.discountPrice = oldData.discountPrice;
                    hist.finalRoomTotalPrice = oldData.finalRoomTotalPrice;
                }
            }
        });

        //  Update old rooms in Room model in bulk
        await Room.updateMany(
            { no: { $in: oldRoomNumbers } },
            { $set: { isBooked: false } }
        );

        //  Process new rooms: add to booking and history
        const newHistories = [];
        const newCurrentRooms = newRooms.map(no => {
            const r = roomMap[no];
            r.isBooked = true; // mark booked in memory
            newHistories.push({
                roomId: r._id,
                roomNo: r.no,
                perDayPrice: r.perDayPrice,
                finalRoomTotalPrice: null,
                discountPrice: null,
                switchInDate: today,
                switchOutDate: booking.checkOut,
                isSwitched: false,
                status: "switched_in",
                switchFrom: oldRooms.map(o => o.roomNo).join(", "),
            });
            return { roomId: r._id, roomNo: r.no, isActive: true };
        });

        booking.currentRooms.push(...newCurrentRooms);
        booking.roomsHistory.push(...newHistories);

        // Update new rooms in Room model in bulk
        await Room.updateMany(
            { no: newRooms },
            { $set: { isBooked: true } }
        );

        // Regenerate QR
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

        // 9. Save booking
        await booking.save();

        return res.status(200).json({
            message: "Rooms switched successfully",
            bookingId: booking._id,
            currentRooms: activeRooms,
            qrUrl: booking.qrUrl
        });

    } catch (err) {
        console.error("Switch rooms error:", err);
        return res.status(err.status || 500).json({ error: err.message || "Failed to switch rooms" });
    }
};

// export const switchRoomsBulk = async (req, res) => {
//     const { bookingId } = req.params;
//     const { oldRooms, newRooms } = req.body;
//
//     if (!Array.isArray(oldRooms) || !Array.isArray(newRooms)) {
//         return res.status(400).json({ error: "oldRooms and newRooms must be arrays" });
//     }
//
//     const session = await mongoose.startSession();
//     const today = new Date();
//
//     try {
//         let booking;
//         await session.withTransaction(async () => {
//             // 1. Fetch booking
//             booking = await Booking.findById(bookingId).session(session);
//             if (!booking) throw Object.assign(new Error("Booking not found"), { status: 404 });
//
//             // 2. Fetch all old rooms and new rooms in one query
//             const roomNumbers = [...oldRooms, ...newRooms];
//             const rooms = await Room.find({ no: { $in: roomNumbers } }).session(session);
//             const roomMap = Object.fromEntries(rooms.map(r => [r.no, r]));
//
//             // 3. Validate all rooms exist and availability
//             for (const oldRoomNo of oldRooms) {
//                 if (!booking.currentRooms.find(r => r.roomNo === oldRoomNo && r.isActive)) {
//                     throw Object.assign(new Error(`Old room ${oldRoomNo} not found or inactive`), { status: 400 });
//                 }
//                 if (!roomMap[oldRoomNo]) throw Object.assign(new Error(`Room ${oldRoomNo} not found`), { status: 400 });
//             }
//             for (const newRoomNo of newRooms) {
//                 const newRoom = roomMap[newRoomNo];
//                 if (!newRoom) throw Object.assign(new Error(`New room ${newRoomNo} not found`), { status: 400 });
//                 if (newRoom.isBooked) throw Object.assign(new Error(`New room ${newRoomNo} is already booked`), { status: 400 });
//             }
//
//             // 4. Update old rooms in memory
//             const oldRoomHistories = [];
//             booking.currentRooms = booking.currentRooms.map(r => {
//                 if (oldRooms.includes(r.roomNo) && r.isActive) {
//                     // Update room as inactive
//                     r.isActive = false;
//
//                     // Find history and update
//                     const hist = booking.roomsHistory.find(h => h.roomNo === r.roomNo && !h.isSwitched);
//                     if (hist) {
//                         hist.switchOutDate = today;
//                         hist.isSwitched = true;
//                         hist.status = "switched_out";
//                         hist.switchFrom = newRooms.join(", ");
//                         oldRoomHistories.push(hist);
//                     }
//                 }
//                 return r;
//             });
//
//             // 5. Update Room models in bulk (old rooms set isBooked=false)
//             await Room.updateMany({ no: { $in: oldRooms } }, { $set: { isBooked: false } }, { session });
//
//             // 6. Add new rooms to booking and history
//             const newHistories = [];
//             const newCurrentRooms = newRooms.map(no => {
//                 const r = roomMap[no];
//                 // Update Room model as booked
//                 r.isBooked = true;
//                 newHistories.push({
//                     roomId: r._id,
//                     roomNo: r.no,
//                     perDayPrice: r.perDayPrice,
//                     finalRoomTotalPrice: null,
//                     discountPrice: null,
//                     switchInDate: today,
//                     switchOutDate: booking.checkOut,
//                     isSwitched: false,
//                     status: "switched_in",
//                     switchFrom: oldRooms.join(", "),
//                 });
//                 return {
//                     roomId: r._id,
//                     roomNo: r.no,
//                     isActive: true,
//                 };
//             });
//
//             booking.currentRooms.push(...newCurrentRooms);
//             booking.roomsHistory.push(...newHistories);
//
//             // 7. Update new rooms in Room model in bulk
//             await Room.updateMany({ no: { $in: newRooms } }, { $set: { isBooked: true } }, { session });
//
//             // 8. Regenerate QR
//             const activeRooms = booking.currentRooms.filter(r => r.isActive).map(r => r.roomNo);
//             const qr = await generateAndUploadQr({
//                 name: booking.guestName,
//                 roomNumbers: activeRooms,
//                 checkIn: booking.checkIn,
//                 checkOut: booking.checkOut,
//                 hotel: booking.hotel,
//             });
//             booking.qrPublicId = qr.publicId;
//             booking.qrUrl = qr.url;
//
//             await booking.save({ session });
//         });
//
//         return res.status(200).json({
//             message: "Rooms switched successfully",
//             bookingId: booking._id,
//             currentRooms: booking.currentRooms.filter(r => r.isActive).map(r => r.roomNo),
//             qrUrl: booking.qrUrl
//         });
//
//     } catch (err) {
//         console.error("Switch rooms error:", err);
//         return res.status(err.status || 500).json({ error: err.message || "Failed to switch rooms" });
//     } finally {
//         session.endSession();
//     }
// };

// Get all rooms for register guest
export const getAllRoomsWithBookingDetails = async (req, res) => {
    try {
        const rooms = await Room.find().lean();

        const enrichedRooms = await Promise.all(
            rooms.map(async (room) => {
                if (room.isBooked) {
                    const booking = await findActiveBookingByRoomNo(room._id);
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