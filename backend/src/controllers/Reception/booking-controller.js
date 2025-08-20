import mongoose from "mongoose";
import Booking from "../../models/Reception/Booking.js";
import Room from "../../models/Room.js";
import {generateAndUploadQr} from "../../utils/qr.js";

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

export const switchRoom = async (req, res) => {
    const { bookingId } = req.params;
    const { oldRoomNo, newRoomNo } = req.body;

    const session = await mongoose.startSession();
    try {
        let booking;
        await session.withTransaction(async () => {
            booking = await Booking.findById(bookingId).session(session);
            if (!booking) {
                throw Object.assign(new Error("Booking not found"), { status: 404 });
            }

            // 1. Find old room in currentRooms
            const oldRoom = booking.currentRooms.find(r => r.roomNo === oldRoomNo && r.isActive);
            if (!oldRoom) {
                throw Object.assign(new Error("Old room not found in current booking"), { status: 400 });
            }

            // 2. Check new room availability
            const newRoom = await Room.findOne({ no: newRoomNo, isBooked: false }).session(session);
            if (!newRoom) {
                throw Object.assign(new Error("New room is not available"), { status: 400 });
            }

            // 3. Free old room
            await Room.updateOne({ _id: oldRoom.roomId }, { $set: { isBooked: false } }, { session });

            // 4. Book new room
            await Room.updateOne({ _id: newRoom._id }, { $set: { isBooked: true } }, { session });

            // 5. Mark old room as inactive
            oldRoom.isActive = false;

            // 6. Add new room as active
            booking.currentRooms.push({
                roomId: newRoom._id,
                roomNo: newRoom.no,
                isActive: true,
            });

            // 7. Update history for old room
            const historyEntry = booking.roomsHistory.find(h => h.roomNo === oldRoomNo && !h.isSwitched);
            if (historyEntry) {
                historyEntry.switchOutDate = new Date();
                historyEntry.isSwitched = true;
            }

            // 8. Add history for new room
            booking.roomsHistory.push({
                roomId: newRoom._id,
                roomNo: newRoom.no,
                perDayPrice: newRoom.perDayPrice,
                roomTotalPrice: null,
                switchInDate: new Date(),
                switchOutDate: booking.checkOut,
                isSwitched: false,
                switchFrom: oldRoomNo,
            });

            // 9. Regenerate QR with updated current rooms
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

            await booking.save({ session });
        });

        return res.status(200).json({
            message: "Room switched successfully",
            bookingId: booking._id,
            currentRooms: booking.currentRooms.filter(r => r.isActive).map(r => r.roomNo),
            qrUrl: booking.qrUrl
        });
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message || "Failed to switch room" });
    } finally {
        session.endSession();
    }
};