import express from "express";
import {createBooking, sendBookingQrViaWhatsApp} from "../controllers/booking-controller.js";

const router = express.Router();

router.post("/", createBooking);
router.post("/:id/send-whatsapp", sendBookingQrViaWhatsApp);

export { router as bookingRoutes };
