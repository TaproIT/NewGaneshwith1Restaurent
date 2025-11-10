import mongoose from "mongoose";
import Invoice from "../../models/Reception/invoice.js";
import Room from "../../models/Room.js";
import { sendErrorResponse, sendSuccessResponse } from "../../utils/response-util.js";
import RoomCategory from "../../models/roomCategory.js";
import { CurrencyTypes } from "../../utils/enums/currency-type.js";


export const generateInvoice = async (req, res) => {
  try {
    const {
      checkInDate,
      checkOutDate,
      hotelType,
      travelAgentName,
      customerName,
      numberOfMembers,
      currencyType,
      selectedRooms, 
      total,
    } = req.body;

    // --- Validation ---
    if (
      !checkInDate ||
      !checkOutDate ||
      !hotelType ||
      !currencyType ||
      !selectedRooms ||
      selectedRooms.length === 0 ||
      (!customerName && !travelAgentName)
    ) {
      return sendErrorResponse(res, 400, "Required fields are missing");
    }

    // --- Validate selectedRooms structure ---
    for (const room of selectedRooms) {
      if (
        !room.roomCategory ||
        !room.count ||
        !room.perDayPrice
      ) {
        return sendErrorResponse(
          res,
          400,
          "Each selected room must have roomCategory, count, and perDayPrice with currencyType & price"
        );
      }

      // Validate room category exists
      const existingCategory = await RoomCategory.findById(room.roomCategory);
      if (!existingCategory) {
        return sendErrorResponse(res, 404, `Room category not found for ID: ${room.roomCategory}`);
      }
    }

    // --- Generate timestamp-based invoice number ---
    const now = new Date();
    const pad = (num) => num.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    // Optionally generate based on first category name or type
    const invoiceNumber = `INV-${timestamp}-${Math.floor(Math.random() * 1000)}`;

    // --- Create invoice ---
    const invoice = await Invoice.create({
      invoiceNumber,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      hotelType,
      customerName,
      travelAgentName,
      numberOfMembers,
      currencyType,
      selectedRooms,
      total,
    });

    return sendSuccessResponse(res, 201, "Invoice generated successfully", { invoice });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, "Invalid invoice ID format");
    }

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return sendErrorResponse(res,404, "Invoice not found");  
    }

     return sendSuccessResponse(
        res,
        200,
        "Invoice retrieve successfully",
        {
            invoice
        }
    );
  } catch (error) {
    return sendErrorResponse(res,500, "Internal Server Error", error.message);
  }
};

export const getInvoices = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const filter = {};

    if (fromDate || toDate) {
      filter.checkInDate = {};
      if (fromDate) filter.checkInDate.$gte = new Date(fromDate);
      if (toDate) filter.checkInDate.$lte = new Date(toDate);
    }

    // ✅ Populate room category details inside selectedRooms
    const invoices = await Invoice.find(filter)
      .populate({
        path: "selectedRooms.roomCategory", // populate the referenced RoomCategory
        select: "name type description", // select only the fields you want
      })
      .sort({ createdAt: -1 });

    // ✅ Transform invoices to include only relevant info
    const formattedInvoices = invoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      checkInDate: invoice.checkInDate,
      checkOutDate: invoice.checkOutDate,
      hotelType: invoice.hotelType,
      customerName: invoice.customerName,
      travelAgentName: invoice.travelAgentName,
      numberOfMembers: invoice.numberOfMembers,
      currencyType: invoice.currencyType,
      total: invoice.total,
      createdAt: invoice.createdAt,
      selectedRooms: invoice.selectedRooms.map((room) => ({
        category: room.roomCategory ? room.roomCategory.name : "Unknown",
        type: room.roomCategory ? room.roomCategory.type : null,
        description: room.roomCategory ? room.roomCategory.description : null,
        count: room.count,
        perDayPrice: room.perDayPrice,
      })),
    }));

    return sendSuccessResponse(res, 200, "Invoices retrieved successfully", {
      invoices: formattedInvoices,
      total: formattedInvoices.length,
    });
  } catch (error) {
    return sendErrorResponse(res, 500, "Internal Server Error", error.message);
  }
};



