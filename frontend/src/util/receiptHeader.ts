// src/util/receiptHeader.ts
// The hotel, restaurant and phone lines printed at the top of restaurant receipts
// (kitchen token and customer bill). Change a restaurant's printed name or phone here.
import { RestaurantTypes } from "@/lib/enums/order-related-enums";

export interface ReceiptHeader {
  hotel: string;
  restaurant: string;
  phone: string;
}

const BEACH: ReceiptHeader = {
  hotel: "GANESH GARDEN BEACH CABANA",
  restaurant: "MAHI MAHI SEA FOOD RESTAURANT",
  phone: "+94 472242529 / +94 705505705",
};

const POOL: ReceiptHeader = {
  hotel: "MARAKOLLIYA BEACH RESORT",
  restaurant: "SUNSET POOL BAR & RESTAURANT",
  phone: "+94 472244822 / +94 705505705",
};

// "NEW RESTAURANT" is a placeholder name. Hotel line and phone are the same as Beach.
const NEW: ReceiptHeader = {
  hotel: "GANESH GARDEN BEACH CABANA",
  restaurant: "NEW RESTAURANT",
  phone: "+94 472242529 / +94 705505705",
};

// Anything that is not Beach or New prints the Pool header, as before
export const getReceiptHeader = (restaurantType?: string): ReceiptHeader =>
  restaurantType === RestaurantTypes.BEACH.value
    ? BEACH
    : restaurantType === RestaurantTypes.NEW.value
    ? NEW
    : POOL;
