import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import {generateAndUploadQr} from "../utils/qr.js";
import {sendWhatsAppMessage} from "../utils/sendWhatsAppMessage.js";

function validateCreateBookingBody(body) {
    const required = [
        "guestName",
        "country",
        "passportId",
        "totalGuests",
        "lengthOfStay",
        "checkIn",
        "checkOut",
        "totalUnits",
        "perDayPrice",
        "hotel",
        "rooms",
        "frontendTotal",
        "payload",
    ];

    const missing = required.filter((k) => body[k] === undefined || body[k] === null);
    if (missing.length) {
        const err = new Error(`Missing required fields: ${missing.join(", ")}`);
        err.status = 400;
        throw err;
    }

    if (!Array.isArray(body.rooms) || body.rooms.length === 0) {
        const err = new Error("rooms must be a non-empty array of ObjectIds");
        err.status = 400;
        throw err;
    }

}

export const createBooking = async (req, res) => {
    try {
        validateCreateBookingBody(req.body);

        const {
            guestName,
            country,
            passportId,
            totalGuests,
            lengthOfStay,
            checkIn,
            checkOut,
            totalUnits,
            perDayPrice,
            whatsapp,
            hotel,
            email,
            rooms: roomIds,
            frontendTotal,
            payload,
            bookingDate,
        } = req.body;

        const rooms = await Room.find({
            _id: { $in: roomIds },
            isBooked: false,
        }).lean();

        if (rooms.length !== roomIds.length) {
            return res.status(400).json({
                error: "Some rooms are already booked or not found.",
            });
        }

        const serverTotal = rooms.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

        if (Number(serverTotal) !== Number(frontendTotal)) {
            return res.status(400).json({
                error: "Total price mismatch.",
                details: { serverTotal, frontendTotal },
            });
        }

        let qr;
        try {
            qr = await generateAndUploadQr(payload, { folder: "bookings/qr" });
        } catch (qrErr) {
            console.error("[QR] generation/upload failed:", qrErr);
            return res.status(500).json({ error: "Failed to generate booking QR." });
        }

        const session = await mongoose.startSession();
        let newBooking;

        try {
            await session.withTransaction(async () => {
                // Double-check & atomically lock rooms (idempotent under race)
                const { modifiedCount } = await Room.updateMany(
                    { _id: { $in: roomIds }, isBooked: false },
                    { $set: { isBooked: true } },
                    { session }
                );

                if (modifiedCount !== roomIds.length) {
                    throw Object.assign(new Error("Room(s) just booked by someone else."), { status: 409 });
                }

                // Create booking document
                newBooking = await Booking.create(
                    [
                        {
                            guestName,
                            country,
                            passportId,
                            totalGuests,
                            lengthOfStay,
                            checkIn,
                            checkOut,
                            totalUnits,
                            perDayPrice,
                            whatsapp,
                            hotel,
                            email,
                            rooms: roomIds,
                            totalPrice: serverTotal,
                            payload, // save the object used in QR for audit/debug
                            qrPublicId: qr.publicId,
                            qrUrl: qr.url,
                            bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
                        },
                    ],
                    { session }
                );
            });
        } catch (txnErr) {
            console.error("[Booking] transaction failed:", txnErr);
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

        return res.status(201).json({ booking: newBooking?.[0] });
    } catch (err) {
        console.error("[createBooking] error:", err);
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
        console.error("[WhatsApp] sendBookingQrViaWhatsApp failed:", err);
        return res.status(500).json({ error: "Failed to generate WhatsApp link" });
    }
};
