import { OrderCounter } from "../models/order/order-counter-model.js";
import { DEFAULT_RESTAURANT_TYPE } from "./enums/order-related-enums.js";


// One running order-number sequence for the single restaurant, e.g. "00001".
export async function generateOrderNumber(restaurantType = DEFAULT_RESTAURANT_TYPE) {
  const counter = await OrderCounter.findOneAndUpdate(
    { restaurantType },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

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
