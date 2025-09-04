import mongoose from "mongoose";

const orderCounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

export const OrderCounter = mongoose.model("OrderCounter", orderCounterSchema);