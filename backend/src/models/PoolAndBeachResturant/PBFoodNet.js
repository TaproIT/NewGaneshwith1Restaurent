import  mongoose from "mongoose";
import { RestaurantTypes } from "../../utils/enums/order-related-enums.js";

const PBFoodNetSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    price: { type: Number, required: true },
    restaurantType: { type: String, required: true, enum: [RestaurantTypes.RESTAURANT.value], default: RestaurantTypes.RESTAURANT.value },
    isVisible: { type: Boolean, default: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "PBFoodNetCategory", required: true },
    isEnableBeverage: { type: Boolean, default: false },
    liquor: [
        {
            beverage: { type: mongoose.Schema.Types.ObjectId, ref: "Beverage", required: true },
            amount: { type: Number, default: 0 },
        },
    ],
}, { timestamps: true });

const PBFoodNet = mongoose.model("PBFoodNet", PBFoodNetSchema);
export default PBFoodNet;