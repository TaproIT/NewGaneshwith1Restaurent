import mongoose from "mongoose";

const orderTokenSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
  },
  tokenNumber: {
    type: Number,
    required: true,
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
  isPrinted: { type: Boolean, required: true },
  //isHold: { type: Boolean, required: true },
  tokenSubTotal: { type: Number, required: true },
  tokenTax: { type: Number, required: false, default: 0 },
  tokenDiscount: { type: Number, required: false, default: 0 },
  tokenServiceCharge: { type: Number, required: false, default: 0 },
  tokenTotalBill: { type: Number, required: true },
});

const OrderToken = mongoose.model("OrderToken", orderTokenSchema);

export default OrderToken;
