import mongoose from "mongoose";
import { RestaurantTypes, TableStatuses } from "../../utils/enums/order-related-enums.js";

const restaurantTableSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    tableNumber: {
        type: Number,
        required: true
    },
    restaurantType: {
        type: String,
        required: true,
        enums: [RestaurantTypes.BEACH.value, RestaurantTypes.POOL.value]
    },
    isSelected: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: TableStatuses.EMPTY.value,
        enums: [TableStatuses.EMPTY.value, TableStatuses.RESERVED.value]
    }
});

const RestaurantTable = mongoose.model("RestaurantTable", restaurantTableSchema);

export default RestaurantTable;