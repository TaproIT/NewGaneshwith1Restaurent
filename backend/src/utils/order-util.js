import { OrderCounter } from "../models/order-counter-model.js";


export async function generateOrderNumber() {
  const counter = await OrderCounter.findOneAndUpdate(
    { name: "orderNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq.toString().padStart(5, "0"); // e.g. 00001, 00002
}


export function generateTokenId(orderNumber) {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${orderNumber}-${day}:${month}:${year}-${hours}:${minutes}:${seconds}`;
}
