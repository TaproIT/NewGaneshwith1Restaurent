import mongoose from "mongoose";

const restaurantTableSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    tableNo: {
        type: Number,
        required: true
    }
});

const RestaurantTable = mongoose.model("RestaurantTable", restaurantTableSchema);

export default RestaurantTable;