import mongoose from "mongoose";
import Invoice from "../../models/Reception/invoice.js";
import Room from "../../models/Room.js";
import { sendErrorResponse, sendSuccessResponse } from "../../utils/response-util.js";

export const generateInvoice = async (req, res) => {
  try {
    const {
      checkInDate,
      checkOutDate,
      customerName,
      numberOfMembers,
      roomIds, // array of room _id or numbers
      subTotal,
      tax,
      discount,
      total
    } = req.body;
    console.log(req.body)

    if (!checkInDate || !checkOutDate || !customerName || !roomIds || roomIds.length === 0) {
      return sendErrorResponse(res,400, "Required fields are missing");
    }

    // Fetch room numbers from DB
    const rooms = await Room.find({ _id: { $in: roomIds } });
    const roomNumbers = rooms.map(r => r.no);

    // Generate timestamp in YYYYMMDD-HHMMSS format
    const now = new Date();
    const pad = (num) => num.toString().padStart(2, "0");

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1); // months start from 0
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    const timestamp = `${year}${month}${day}-${hours}${minutes}${seconds}`;

    // Create invoice number
    const invoiceNumber = `INV-${timestamp}-${roomNumbers.join("")}`;

    // Create invoice document
    const invoice = await Invoice.create({
      invoiceNumber,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      customerName,
      numberOfMembers,
      roomIds,
      subTotal,
      tax,
      discount,
      total
    });
    
    return sendSuccessResponse(
        res,
        201,
        "Invoice generated successfully",
        {
            invoice
        }
    );
  } catch (error) {
     return sendErrorResponse(res,500, "Internal Server Error", error.message);
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

    // if (roomId) {
    //   filter.roomIds = roomId;
    // }

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
     return sendSuccessResponse(
        res,
        200,
        "Invoices retrieved successfully",
        {
            invoices,
            total: invoices.length,
        }
    );
  } catch (error) {
    return sendErrorResponse(res,500, "Internal Server Error", error.message);
  }
};

