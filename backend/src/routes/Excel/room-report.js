// routes/report.routes.js
import express from "express";
import {
    exportRoomReportsToExcel,
    getBookingAndRoomReports,
    saveRoomReports
} from "../../controllers/Excel/room-report.js";


const router = express.Router();

// GET → fetch bookings + room reports
router.get("/", getBookingAndRoomReports);

// POST → save new room reports
router.post("/", saveRoomReports);

// GET → export room reports to Excel
router.get("/export", exportRoomReportsToExcel);

export default router;
