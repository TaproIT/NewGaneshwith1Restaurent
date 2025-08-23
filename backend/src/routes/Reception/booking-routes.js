import express from "express";
import {
    createBooking, getAllRoomsWithBookingDetails, getBookingWithActiveRoomsAndPrices,
    sendBookingQrViaWhatsApp,
    switchRoomsBulk
} from "../../controllers/Reception/booking-controller.js";

const router = express.Router();

router.post("/", createBooking);
router.put("/:bookingId/switch-rooms", switchRoomsBulk);
router.post("/:id/send-whatsapp", sendBookingQrViaWhatsApp);
router.get("/active-rooms-with-prices/:roomNo", getBookingWithActiveRoomsAndPrices);
router.get("/details/all-rooms", getAllRoomsWithBookingDetails);

export { router as bookingRoutes };
