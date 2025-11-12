import { InvoiceCounter } from "../models/Reception/invoice-counter.model.js";

export async function generateInvoiceNumber() {
  const counter = await InvoiceCounter.findOneAndUpdate(
    { name: "INVOICE" }, // 👈 unique name identifier
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `INV-${String(counter.seq).padStart(6, "0")}`;
}
