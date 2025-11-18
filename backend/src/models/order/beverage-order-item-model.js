import mongoose from "mongoose";
import { RestaurantTypes } from "../../utils/enums/order-related-enums.js";

const beverageOrderItemSchema = new mongoose.Schema({
  beverageId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
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
  liquor: [
    {
      liquorId: { type: String },
      liquorName: { type: String },
      amount: { type: Number },
    },
  ],
  restaurantType: {
    type:String, required:true, enum : [RestaurantTypes.BEACH.value, RestaurantTypes.POOL.value]
  }
},
{ timestamps: true }
);

const BeverageOrderItem = mongoose.model("BeverageOrderItem", beverageOrderItemSchema);

export default BeverageOrderItem;
