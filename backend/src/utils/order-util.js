import { OrderCounter } from "../models/order/order-counter-model.js";


export async function generateOrderNumber(restaurantType) {
  if (!restaurantType) {
    throw new Error("Restaurant type is required to generate an order number.");
  }

  const counter = await OrderCounter.findOneAndUpdate(
    { restaurantType }, // use restaurantType instead of fixed name
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // Generate a prefix based on restaurant type
  const prefix = restaurantType.toUpperCase().slice(0, 3); // e.g. "DIN", "DEL", "TAK"

  // Format: e.g., DIN-00001
  return `${counter.seq.toString().padStart(5, "0")}`;
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
