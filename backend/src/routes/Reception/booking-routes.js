import express from "express";
import {
    createBooking,
    getAllReservedRoomsWithBookingDetails,
    getAllRoomsWithBookingDetails,
    getBookingWithActiveRoomsAndPrices,
    sendBookingQrViaEmail,
    sendBookingQrViaWhatsApp,
    switchRoomsBulk
} from "../../controllers/Reception/booking-controller.js";

const router = express.Router();

router.post("/", createBooking);
router.put("/:bookingId/switch-rooms", switchRoomsBulk);
router.post("/:id/send-whatsapp", sendBookingQrViaWhatsApp);
router.post("/:id/send-email", sendBookingQrViaEmail);
router.get("/active-rooms-with-prices/:roomNo", getBookingWithActiveRoomsAndPrices);
router.get("/details/all-rooms", getAllRoomsWithBookingDetails);
router.get("/details/reserved-all-rooms", getAllReservedRoomsWithBookingDetails );

export { router as bookingRoutes };
