import mongoose from  "mongoose";
import { RestaurantTypes } from "../../utils/enums/order-related-enums.js";

const PBFoodNetCategorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    restaurantType: { type: String, required: true, enums: [RestaurantTypes.BEACH.value, RestaurantTypes.POOL.value, RestaurantTypes.NEW.value] },
    isVisible: { type: Boolean, default: true }
}, { timestamps: true });

const PBFoodNetCategory = mongoose.model("PBFoodNetCategory", PBFoodNetCategorySchema);
export default PBFoodNetCategory;
