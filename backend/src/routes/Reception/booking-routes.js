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
    addOrderToBooking, updateBooking, getAllActiveBookings, getBookingById, getSpecificBookingDetails
} from "../../controllers/Reception/booking-controller.js";
import {
    finalizeBookingBill,
    getBookingBillingSummary,
} from "../../controllers/Reception/total-bill-calculation-controller.js";
import {authenticateToken} from "../../middleware/verify-token.js";

const router = express.Router();

router.post("/", authenticateToken, createBooking);
router.put("/:bookingId/switch-rooms", switchRoomsBulk);
router.post("/:id/send-whatsapp", sendBookingQrViaWhatsApp);
router.post("/:id/send-email", sendBookingQrViaEmail);
router.get("/active-rooms-with-prices/:roomNo", getBookingWithActiveRoomsAndPrices);
router.get("/details/all-rooms", getAllRoomsWithBookingDetails);
router.get("/extended-today", getTodayExtendedRooms);
router.get("/details/reserved-all-rooms", getAllReservedRoomsWithBookingDetails );
router.patch("/:id/add-order", addOrderToBooking);
router.put("/:id/update-booking",authenticateToken, updateBooking);
router.post("/get-all-active-bookings",getAllActiveBookings);
router.get("/get-booking/:id", getBookingById);
router.get("/specific/details/:id",getSpecificBookingDetails)

// orders with booking
router.get("/final-billing/:id/billing-summary",  authenticateToken, getBookingBillingSummary);
router.post("/final-billing/:id/checkout",  authenticateToken,  finalizeBookingBill);

export { router as bookingRoutes };
