import mongoose from "mongoose";

const orderCounterSchema = new mongoose.Schema({
  restaurantType: { type: String, required: true, unique: true }, // e.g., "dine-in", "takeaway", "delivery"
  seq: { type: Number, default: 0 },
});

export const OrderCounter = mongoose.model("OrderCounter", orderCounterSchema);
