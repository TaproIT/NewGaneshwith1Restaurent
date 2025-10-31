import express from "express";
import {getMonthlyGuestRegistrations, getMonthlySummary} from "../controllers/hotelDashboardController.js";


const router = express.Router();

router.get("/monthly-summary", getMonthlySummary);
router.get("/monthly-guests", getMonthlyGuestRegistrations);

export default router;
