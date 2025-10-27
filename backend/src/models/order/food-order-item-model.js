import mongoose from "mongoose";

const foodOrderItemSchema = new mongoose.Schema({
  foodId: {
    type: String,
    required: true,
  },
  title: {
    type : String,
    required: true
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

const FoodOrderItem = mongoose.model("FoodOrderItem", foodOrderItemSchema);

export default FoodOrderItem;
