import mongoose from "mongoose";

const beverageOrderItemSchema = new mongoose.Schema({
  beverageId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const BeverageOrderItem = mongoose.model("BeverageOrderItem", beverageOrderItemSchema);

export default BeverageOrderItem;
