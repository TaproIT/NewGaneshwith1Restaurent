import mongoose from "mongoose";
import { GuestTypes, OrderTypes, OrderStatuses, PaymentMethods, OrderProgressStatuses } from "../utils/enums/order.enums.js";

const orderSchema = new mongoose.Schema({
  guestType: {
    type: String,
    required: true,
    enum: [GuestTypes.CHECKED_IN.value, GuestTypes.WALK_IN.value],
  },
  orderType: {
    type: String,
    required: true,
    enum: [OrderTypes.DINE_IN.value, OrderTypes.SAVE_TO_ROOM.value, OrderTypes.TAKE_AWAY.value],
  },
  roomNumber: {
    type: String,
    required: true,
  },
  guestId: {
    type: String,
    required: true,
  },
  restaurantTable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RestaurantTable",
  },
  orderStatus: {
    type: String,
    enum: [OrderStatuses.PROCESSING.value, OrderStatuses.COMPLETED.value],
  },
  orderTokens: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderToken",
    },
  ],
  paymentMethod: {
    type: String,
    enum: [PaymentMethods.CASH.value, PaymentMethods.CARD.value, PaymentMethods.CASH_AND_CARD.value],
  },
  orderProgressStatus: {
    type: Number,
    required: true,
    enum: Object.values(OrderProgressStatuses).map((s) => s.value),
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
