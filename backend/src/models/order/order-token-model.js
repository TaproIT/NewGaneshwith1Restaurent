import mongoose from "mongoose";

const orderTokenSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
  },
  tokenNumber: {
    type: Number,
    required: true
  },
  beverageOrders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BeverageOrderItem",
    },
  ],
  foodOrders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodOrderItem",
    },
  ],
  tokenSubTotal: { type: Number, required: true },
  tokenTax: { type: Number, required: true },
  tokenDiscounts: { type: Number, required: true },
  tokenTotalBill: { type: Number, required: true },
});

const OrderToken = mongoose.model("OrderToken", orderTokenSchema);

export default OrderToken;
