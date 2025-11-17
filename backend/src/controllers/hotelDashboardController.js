
import dayjs from "dayjs";
import Booking from "../models/Reception/booking.js";
import Room from "../models/Room.js";
import Invoice from "../models/Reception/invoice.js";

export const getMonthlySummary = async (req, res) => {
    try {
        const startOfMonth = dayjs().startOf("month").toDate();
        const endOfMonth = dayjs().endOf("month").toDate();

        // Aggregate total guests per hotel
        const bookings = await Booking.aggregate([
            {
                $match: {
                    bookingDate: { $gte: startOfMonth, $lte: endOfMonth },
                },
            },
            {
                $group: {
                    _id: "$hotel",
                    totalGuests: { $sum: "$totalGuests" },
                },
            },
        ]);

        const hotelGanesh = bookings.find((b) => b._id === "Ganesh Garden Beach Cabana");
        const hotelMarakolliya = bookings.find((b) => b._id === "Marakolliya Beach Resort");

        // Total available rooms (not booked + not under maintenance)
        const totalAvailableRooms = await Room.countDocuments({
            isBooked: false,
            isMaintenance: false,
        });

        // Total invoices generated in the current month
        const totalInvoices = await Invoice.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        res.status(200).json({
            month: dayjs().format("MMMM YYYY"),
            totalGuests: {
                ganeshGardenBeachCabana: hotelGanesh ? hotelGanesh.totalGuests : 0,
                marakolliyaBeachResort: hotelMarakolliya ? hotelMarakolliya.totalGuests : 0,
            },
            totalAvailableRooms,
            totalInvoices,
        });
    } catch (err) {
        console.error("Monthly summary error:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};


// export const getMonthlyGuestRegistrations = async (req, res) => {
//     try {
//         const result = await Booking.aggregate([
//             {
//                 // Group by year, month, and hotel
//                 $group: {
//                     _id: {
//                         year: { $year: "$bookingDate" },
//                         month: { $month: "$bookingDate" },
//                         hotel: "$hotel",
//                     },
//                     totalGuests: { $sum: "$totalGuests" },
//                 },
//             },
//             {
//                 $sort: { "_id.year": 1, "_id.month": 1 },
//             },
//         ]);
//
//         // Combine Hotel A and B into one record per month
//         const monthlyData = {};
//
//         result.forEach((item) => {
//             const { year, month, hotel } = item._id;
//             const key = `${year}-${month}`;
//
//             if (!monthlyData[key]) {
//                 monthlyData[key] = {
//                     year,
//                     monthNumber: month,
//                     hotelA: 0,
//                     hotelB: 0,
//                 };
//             }
//
//             if (hotel === "Hotel A") monthlyData[key].hotelA += item.totalGuests;
//             if (hotel === "Hotel B") monthlyData[key].hotelB += item.totalGuests;
//         });
//
//         // Format the output with month names
//         const formattedData = Object.values(monthlyData).map((item) => {
//             const date = new Date(item.year, item.monthNumber - 1);
//             const monthName = date.toLocaleString("default", {
//                 month: "long",
//                 year: "numeric",
//             });
//
//             return {
//                 month: monthName,
//                 monthNumber: item.monthNumber,
//                 hotelA: item.hotelA,
//                 hotelB: item.hotelB,
//             };
//         });
//
//         res.status(200).json(formattedData);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

export const getMonthlyGuestRegistrations = async (req, res) => {
    try {
        const result = await Booking.aggregate([
            {
                // Group by year, month, and hotel
                $group: {
                    _id: {
                        year: { $year: "$bookingDate" },
                        month: { $month: "$bookingDate" },
                        hotel: "$hotel",
                    },
                    totalGuests: { $sum: "$totalGuests" },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
        ]);

        const monthlyData = {};

        result.forEach((item) => {
            const { year, month, hotel } = item._id;
            const key = `${year}-${month}`;

            if (!monthlyData[key]) {
                monthlyData[key] = {
                    year,
                    monthNumber: month,
                    GaneshGardenBeachCabana: 0,
                    MarakolliyaBeachResort: 0,
                };
            }

            if (hotel === "Ganesh Garden Beach Cabana") {
                monthlyData[key].GaneshGardenBeachCabana += item.totalGuests;
            }

            if (hotel === "Marakolliya Beach Resort") {
                monthlyData[key].MarakolliyaBeachResort += item.totalGuests;
            }
        });

        const formattedData = Object.values(monthlyData).map((item) => {
            const date = new Date(item.year, item.monthNumber - 1);
            const monthName = date.toLocaleString("default", {
                month: "long",
                year: "numeric",
            });

            return {
                month: monthName,
                monthNumber: item.monthNumber,
                GaneshGardenBeachCabana: item.GaneshGardenBeachCabana,
                MarakolliyaBeachResort: item.MarakolliyaBeachResort,
            };
        });

        res.status(200).json(formattedData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
