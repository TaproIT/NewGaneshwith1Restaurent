import express from "express";
import {
    createBooking,
    getAllRoomsWithBookingDetails,
    getBookingWithActiveRoomsAndPrices,
    getTodayExtendedRooms,
    sendBookingQrViaEmail,
    getAllReservedRoomsWithBookingDetails,
    sendBookingQrViaWhatsApp,
    switchRoomsBulk,
    addOrderToBooking
} from "../../controllers/Reception/booking-controller.js";
import {
    finalizeBookingBill,
    getBookingBillingSummary,
} from "../../controllers/Reception/total-bill-calculation-controller.js";

const router = express.Router();

router.post("/", createBooking);
router.put("/:bookingId/switch-rooms", switchRoomsBulk);
router.post("/:id/send-whatsapp", sendBookingQrViaWhatsApp);
router.post("/:id/send-email", sendBookingQrViaEmail);
router.get("/active-rooms-with-prices/:roomNo", getBookingWithActiveRoomsAndPrices);
router.get("/details/all-rooms", getAllRoomsWithBookingDetails);
router.get("/extended-today", getTodayExtendedRooms);
router.get("/details/reserved-all-rooms", getAllReservedRoomsWithBookingDetails );
router.patch("/:id/add-order", addOrderToBooking);

// orders with booking
router.get("/final-billing/:id/billing-summary", getBookingBillingSummary);
router.post("/final-billing/:id/checkout",  finalizeBookingBill);

export { router as bookingRoutes };
