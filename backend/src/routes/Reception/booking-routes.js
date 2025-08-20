import express from "express";
import {createBooking, sendBookingQrViaWhatsApp, switchRoom} from "../../controllers/Reception/booking-controller.js";

const router = express.Router();

router.post("/", createBooking);
router.put("/:bookingId", switchRoom);
router.post("/:id/send-whatsapp", sendBookingQrViaWhatsApp);

export { router as bookingRoutes };
