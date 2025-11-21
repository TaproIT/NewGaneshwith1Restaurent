import Booking from "../../models/Reception/booking.js";
import RoomReport from "../../models/Excel/roomReportSchema.js";
import ExcelJS from "exceljs";
import mongoose from "mongoose";
export const getBookingAndRoomReports = async (req, res) => {
    try {
        let { start, end } = req.query;

        let startDate = start ? new Date(start + "T00:00:00.000Z") : null;
        let endDate = end ? new Date(end + "T23:59:59.999Z") : null;

        let dateFilter = {};

        if (startDate && endDate) {
            dateFilter.roomsHistory = {
                $elemMatch: {
                    switchOutDate: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            };
        }

        // 🔹 A) Get all bookingIds already in reports
        const reported = await RoomReport.find().select("bookingId -_id").lean();
        const reportedIds = new Set(reported.map(r => String(r.bookingId)));

        // 1️⃣ Fetch checked-out bookings
        const bookings = await Booking.find({
            isCheckOut: true,
            ...dateFilter
        }).lean();

        // 🔹 B) Remove bookings that already have a report
        const filteredBookings = bookings.filter(b => !reportedIds.has(String(b._id)));

        // 2️⃣ Build bookingReports from FILTERED bookings
        let bookingReports = filteredBookings.flatMap(b =>
            b.roomsHistory
                .filter(room =>
                    startDate && endDate
                        ? room.switchOutDate >= startDate &&
                        room.switchOutDate <= endDate
                        : true
                )
                .map(room => {
                    const total = room.finalRoomTotalPrice || 0;
                    const service = total * 0.10;
                    const net = total - service;

                    return {
                        bookingId: b._id,
                        hotel: b.hotel,
                        guestName: b.guestName,
                        roomNo: room.roomNo,
                        checkIn: room.switchInDate,
                        checkOut: room.switchOutDate,

                        perDayPrice: Number(room.perDayPrice?.toFixed(2)),
                        currencyRate: Number(room.currencyRate?.toFixed(2)),
                        totalRoomPrice: Number(total.toFixed(2)),

                        nights: room.night,
                        totalGuests: b.totalGuests,
                        breakfast: b.breakfast,

                        grossTotal: Number(total.toFixed(2)),
                        serviceCharge: Number(service.toFixed(2)),
                        netIncome: Number(net.toFixed(2))
                    };
                })
        );

        bookingReports.sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut));

        const savedReports = await RoomReport.find(
            startDate && endDate
                ? { checkOut: { $gte: startDate, $lte: endDate } }
                : {}
        ).lean();

        return res.status(200).json({
            success: true,
            bookings: bookingReports, // now only NEW bookings
            reports: savedReports
        });

    } catch (err) {
        console.error("GET report failed:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};
//
//
// export const saveRoomReports = async (req, res) => {
//     try {
//         const reports = req.body;
//
//         if (!Array.isArray(reports) || reports.length === 0) {
//             return res.status(400).json({ success: false, message: "No report data provided" });
//         }
//
//         let updatedCount = 0;
//         let createdCount = 0;
//
//         for (const r of reports) {
//             // Validate bookingId
//             if (!r.bookingId || !mongoose.Types.ObjectId.isValid(r.bookingId)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Invalid bookingId for guest: ${r.guestName}`
//                 });
//             }
//
//             // Calculate financials
//             const grossTotal = (r.totalRoomPrice || 0) - (r.bookingCommission || 0) - (r.totalBreakfastPrice || 0);
//             const serviceCharge = grossTotal / 11;
//             const netIncome = serviceCharge * 10;
//
//             const reportData = {
//                 ...r,
//                 grossTotal,
//                 serviceCharge,
//                 netIncome
//             };
//
//             const existingReport = await RoomReport.findOne({ bookingId: r.bookingId });
//
//             if (existingReport) {
//                 await RoomReport.updateOne({ bookingId: r.bookingId }, { $set: reportData });
//                 updatedCount++;
//             } else {
//                 await RoomReport.create(reportData);
//                 createdCount++;
//             }
//         }
//
//         return res.status(200).json({
//             success: true,
//             message: "Room reports processed successfully",
//             updatedCount,
//             createdCount
//         });
//
//     } catch (err) {
//         console.error("POST saveRoomReports error:", err);
//         return res.status(500).json({ success: false, message: "Server Error", error: err.message });
//     }
// };

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

            // Recalculate required financial fields
            const grossTotal =
                (r.totalRoomPrice || 0) -
                (r.bookingCommission || 0) -
                (r.totalBreakfastPrice || 0);

            const serviceCharge = grossTotal / 11;
            const netIncome = serviceCharge * 10;

            const reportData = {
                ...r,
                grossTotal,
                serviceCharge,
                netIncome,
                updatedAt: new Date()
            };

            // Check if report exists for this booking
            const existingReport = await RoomReport.findOne({ bookingId: r.bookingId });

            if (existingReport) {
                // ➤ Update existing report
                await RoomReport.updateOne(
                    { bookingId: r.bookingId },
                    { $set: reportData }
                );
                updatedCount++;
            } else {
                // ➤ Create as new report
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
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
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
                bookingId: r.bookingId,
                hotel: r.hotel,
                guestName: r.guestName,
                roomNo: r.roomNo,

                checkIn: r.checkIn ? r.checkIn.toISOString().split("T")[0] : "",
                checkOut: r.checkOut ? r.checkOut.toISOString().split("T")[0] : "",

                perDayPrice: r.perDayPrice?.toFixed(2),
                currencyRate: r.currencyRate?.toFixed(2),
                nights: r.nights,
                totalRoomPrice: r.totalRoomPrice?.toFixed(2),
                totalGuests: r.totalGuests,
                breakfast: r.breakfast,

                bookingCommission: r.bookingCommission?.toFixed(2),
                totalBreakfastPrice: r.totalBreakfastPrice?.toFixed(2),

                grossTotal: r.grossTotal?.toFixed(2),
                serviceCharge: r.serviceCharge?.toFixed(2),
                netIncome: r.netIncome?.toFixed(2),
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
