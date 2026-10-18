import mongoose from "mongoose";
import { CustomerTypes, ServiceTypes, OrderStatuses, PaymentMethods, RestaurantTypes } from "../../utils/enums/order-related-enums.js";

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true
  },
  customerType: {
    type: String,
    required: true,
    enum: [CustomerTypes.CHECKED_IN.value, CustomerTypes.WALK_IN.value],
  },
  serviceType: {
    type: String,
    required: true,
    enum: [ServiceTypes.DINE_IN.value, ServiceTypes.SAVE_TO_ROOM.value, ServiceTypes.TAKE_AWAY.value],
  },
  restaurantType: {
    type: String,
    required: true,
    enum: [RestaurantTypes.RESTAURANT.value],
    default: RestaurantTypes.RESTAURANT.value
  },
  roomNumber: {
    type: String,
    required: true,
  },
  guestName: {
    type: String,
    required: true
  },
  guestId: {
    type: String,
    //required: true,
  },
  restaurantTable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RestaurantTable",
  },
  orderStatus: {
    type: Number,
    required: true,
    enum: Object.values(OrderStatuses).map((s) => s.value),
  },
  orderTokens: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderToken",
    },
  ],
  holdOrderToken: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrderToken",
  },
  subTotal:{
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  serviceCharge: {
    type: Number,
    default: 0,
  },
  totalBill: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: [PaymentMethods.CASH.value, PaymentMethods.CARD.value, PaymentMethods.FREE_BILL.value, PaymentMethods.ROOM.value],
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  checkOutUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
  // orderProgressStatus: {
  //   type: Number,
  //   required: true,
  //   enum: Object.values(OrderProgressStatuses).map((s) => s.value),
  // },
},{
  timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
