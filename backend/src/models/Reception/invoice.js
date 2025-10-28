import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    customerName: { type: String, required: true },
    numberOfMembers: { type: Number, required: true },
    roomIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    ],
    subTotal: { type: mongoose.Schema.Types.Decimal128, required: true },
    tax: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    discount: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    total: { type: mongoose.Schema.Types.Decimal128, required: true },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
