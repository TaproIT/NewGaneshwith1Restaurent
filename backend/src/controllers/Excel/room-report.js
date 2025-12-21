import Booking from "../../models/Reception/booking.js";
import RoomReport from "../../models/Excel/roomReportSchema.js";
import ExcelJS from "exceljs";
import mongoose from "mongoose";
import { log } from "console";

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

        // 🔹 A) Get all existing reports using composite key: bookingId + roomNo
        const reported = await RoomReport.find().select("bookingId roomNo -_id").lean();
        const reportedSet = new Set(reported.map(r => `${String(r.bookingId)}|${r.roomNo}`));

        // 1️⃣ Fetch checked-out bookings
        const bookings = await Booking.find({
            isCheckOut: true,
            ...dateFilter
        }).lean();

        // 🔹 B) Build bookingReports, checking composite key to avoid duplicates
        let bookingReports = bookings.flatMap(b =>
            b.roomsHistory
                .filter(room =>
                    startDate && endDate
                        ? room.switchOutDate >= startDate &&
                        room.switchOutDate <= endDate
                        : true
                )
                .filter(room => {
                    // Skip if report already exists for this booking + room combination
                    const compositeKey = `${String(b._id)}|${room.roomNo}`;
                    return !reportedSet.has(compositeKey);
                })
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
                        currencyType: String(room.currency),
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


export const saveRoomReports = async (req, res) => {
    try {
        const reports = req.body;
        console.log("report re body :" + req.body);
        

        if (!Array.isArray(reports) || reports.length === 0) {
            return res.status(400).json({ success: false, message: "No report data provided" });
        }

        let updatedCount = 0;
        let createdCount = 0;

        const bookingIds = [...new Set(reports.map(r => r.bookingId).filter(id => mongoose.Types.ObjectId.isValid(id)))];
        
        // 2. Fetch all related bookings in one go (Source of Truth)
        const bookings = await Booking.find({ _id: { $in: bookingIds } }).lean();
        
        // 3. Create a lookup map for fast access: "bookingId|roomNo" -> roomData
        const bookingLookup = new Map();
        bookings.forEach(b => {
            b.roomsHistory.forEach(room => {
                bookingLookup.set(`${String(b._id)}|${room.roomNo}`, room);
            });
        });
        

        for (const r of reports) {
            // Validate bookingId
            if (!r.bookingId || !mongoose.Types.ObjectId.isValid(r.bookingId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid bookingId for guest: ${r.guestName}`
                });
            }

            const compositeKey = `${r.bookingId}|${r.roomNo}`;
            const originalRoomData = bookingLookup.get(compositeKey);

            // Default to 1 if something is terribly wrong, otherwise use the Real Rate
            const realCurrencyRate = originalRoomData?.currencyRate || 1;

            // Recalculate required financial fields
            const grossTotal =
                (r.totalRoomPrice || 0) -
                (r.bookingCommission || 0) -
                (r.totalBreakfastPrice || 0);

            const serviceCharge = grossTotal / 11;
            const netIncome = serviceCharge * 10;

            const reportData = {
                ...r,
                currencyRate: realCurrencyRate,
                grossTotal,
                serviceCharge,
                netIncome,
                updatedAt: new Date()
            };

            console.log("room data: " + originalRoomData);
            console.log("currency rate: " + realCurrencyRate);
            

            if (!r._id || r._id === "") {
                const dataToSave = { ...reportData };
                delete dataToSave._id;

                // Upsert by composite key (bookingId + roomNo) to ensure one report per room
                const filter = { bookingId: r.bookingId, roomNo: r.roomNo };
                const opts = { upsert: true, new: true, setDefaultsOnInsert: true, rawResult: true };
                const upsertRes = await RoomReport.findOneAndUpdate(filter, { $set: dataToSave }, opts);

                // rawResult gives lastErrorObject.updatedExisting (true if updated, false if inserted)
                if (upsertRes && upsertRes.lastErrorObject && upsertRes.lastErrorObject.updatedExisting) {
                    updatedCount++;
                } else {
                    createdCount++;
                }
            } else {
                if (!mongoose.Types.ObjectId.isValid(r._id)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid _id for guest: ${r.guestName}`
                    });
                }

                const existingReport = await RoomReport.findById(r._id);
                if (!existingReport) {
                    return res.status(404).json({
                        success: false,
                        message: `Report not found for _id: ${r._id}`
                    });
                }

                await RoomReport.updateOne(
                    { _id: r._id },
                    { $set: reportData }
                );
                updatedCount++;
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

        const filter = { checkOut: { $exists: true } };

        if (start) {
            filter.checkOut.$gte = new Date(start); // start of day
        }

        if (end) {
            const endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999); // include entire end day
            filter.checkOut.$lte = endDate;
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
                currencyType: r.currencyType,
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


