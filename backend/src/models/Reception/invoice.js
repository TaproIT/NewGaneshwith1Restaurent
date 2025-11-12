import mongoose from "mongoose";
import { CurrencyTypes } from "../../utils/enums/currency-type.js";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    hotelType: { type: String, required: true },
    customerName: { type: String },
    travelAgentName: { type: String },
    numberOfMembers: { type: Number, required: true },
    currencyType: {
      type: String,
      required: true,
      enums: [
        CurrencyTypes.LKR.value,
        CurrencyTypes.USD.value,
        CurrencyTypes.EUR.value,
      ],
    },
    selectedRooms: [
      {
        roomCategory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RoomCategory",
          required: true,
        },
        count: {
          type: Number,
          required: true,
        },
        perDayPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    total: { type: mongoose.Schema.Types.Decimal128, required: true },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema); 
export default Invoice;
