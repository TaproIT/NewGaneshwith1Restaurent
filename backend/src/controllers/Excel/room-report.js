import Booking from "../../models/Reception/booking.js";
import RoomReport from "../../models/Excel/roomReportSchema.js";
import ExcelJS from "exceljs";
import mongoose from "mongoose";

export const getBookingAndRoomReports = async (req, res) => {
    try {
        let { start, end } = req.query;

        let dateFilter = {};

        // Apply filters ONLY if both dates provided
        if (start && end) {
            dateFilter.roomsHistory = {
                $elemMatch: {
                    switchOutDate: {
                        $gte: new Date(start),
                        $lte: new Date(end)
                    }
                }
            };
        }

        // 1️⃣ Fetch checked-out bookings with date filter
        const bookings = await Booking.find({
            isCheckOut: true,
            ...dateFilter
        }).lean();

        // 2️⃣ Map extracted room reports
        const bookingReports = bookings
            .flatMap(b =>
                b.roomsHistory
                    .filter(room =>
                        start && end
                            ? room.switchOutDate >= new Date(start) &&
                            room.switchOutDate <= new Date(end)
                            : true
                    )
                    .map(room => ({
                        bookingId: b._id,
                        hotel: b.hotel,
                        guestName: b.guestName,
                        roomNo: room.roomNo,
                        checkIn: room.switchInDate,
                        checkOut: room.switchOutDate,
                        perDayPrice: room.perDayPrice,
                        currencyRate: room.currencyRate,
                        nights: room.night,
                        totalRoomPrice: room.finalRoomTotalPrice,
                        totalGuests: b.totalGuests,
                        breakfast: b.breakfast,
                        // Calculations
                        grossTotal: room.finalRoomTotalPrice,
                        serviceCharge: room.finalRoomTotalPrice * 0.10,
                        netIncome: room.finalRoomTotalPrice - room.finalRoomTotalPrice * 0.10
                    }))
            );

        // 3️⃣ Fetch roomReports saved earlier
        const savedReports = await RoomReport.find(
            start && end
                ? { checkOut: { $gte: new Date(start), $lte: new Date(end) } }
                : {}
        ).lean();

        return res.status(200).json({
            success: true,
            bookings: bookingReports,
            savedReports
        });

    } catch (err) {
        console.error("GET report failed:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

export const saveRoomReports = async (req, res) => {
    try {
        const reports = req.body;

        if (!Array.isArray(reports) || reports.length === 0) {
            return res.status(400).json({ success: false, message: "No report data provided" });
        }

        let updatedCount = 0;
        let createdCount = 0;

        for (const r of reports) {
            // Validate bookingId
            if (!r.bookingId || !mongoose.Types.ObjectId.isValid(r.bookingId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid bookingId for guest: ${r.guestName}`
                });
            }

            // Calculate financials
            const grossTotal = (r.totalRoomPrice || 0) - (r.bookingCommission || 0) - (r.totalBreakfastPrice || 0);
            const serviceCharge = grossTotal / 11;
            const netIncome = serviceCharge * 10;

            const reportData = {
                ...r,
                grossTotal,
                serviceCharge,
                netIncome
            };

            const existingReport = await RoomReport.findOne({ bookingId: r.bookingId });

            if (existingReport) {
                await RoomReport.updateOne({ bookingId: r.bookingId }, { $set: reportData });
                updatedCount++;
            } else {
                await RoomReport.create(reportData);
                createdCount++;
            }
        }

        return res.status(200).json({
            success: true,
            message: "Room reports processed successfully",
            updatedCount,
            createdCount
        });

    } catch (err) {
        console.error("POST saveRoomReports error:", err);
        return res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};



export const exportRoomReportsToExcel = async (req, res) => {
    try {
        const { start, end } = req.query;

        const filter = {};
        if (start && end) {
            filter.checkOut = {
                $gte: new Date(start),
                $lte: new Date(end)
            };
        }

        const reports = await RoomReport.find(filter).lean();

        if (!reports.length) {
            return res.status(404).json({
                success: false,
                message: "No reports found"
            });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Room Reports");

        worksheet.columns = [
            { header: "Booking ID", key: "bookingId", width: 25 },
            { header: "Hotel", key: "hotel", width: 25 },
            { header: "Guest Name", key: "guestName", width: 25 },
            { header: "Room No", key: "roomNo", width: 10 },
            { header: "Check In", key: "checkIn", width: 20 },
            { header: "Check Out", key: "checkOut", width: 20 },
            { header: "Per Day Price", key: "perDayPrice", width: 15 },
            { header: "Currency Rate", key: "currencyRate", width: 15 },
            { header: "Nights", key: "nights", width: 10 },
            { header: "Total Room Price", key: "totalRoomPrice", width: 20 },
            { header: "Total Guests", key: "totalGuests", width: 10 },
            { header: "Breakfast", key: "breakfast", width: 15 },
            { header: "Booking Commission", key: "bookingCommission", width: 20 },
            { header: "Total Breakfast Price", key: "totalBreakfastPrice", width: 20 },
            { header: "Gross Total", key: "grossTotal", width: 15 },
            { header: "Service Charge", key: "serviceCharge", width: 15 },
            { header: "Net Income", key: "netIncome", width: 15 },
        ];

        reports.forEach(r => {
            worksheet.addRow({
                ...r,
                checkIn: r.checkIn ? r.checkIn.toISOString().split("T")[0] : "",
                checkOut: r.checkOut ? r.checkOut.toISOString().split("T")[0] : "",
            });
        });

        worksheet.getRow(1).font = { bold: true };

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=RoomReports_${start || "all"}-${end || "all"}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Excel export error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
};
