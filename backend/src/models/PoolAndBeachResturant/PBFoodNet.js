import  mongoose from "mongoose";

const PBFoodNetSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    price: { type: Number, required: true },
    restaurantType: { type: String, required: true },
    isVisible: { type: Boolean, default: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "PBFoodNetCategory", required: true },
    isEnableBeverage: { type: Boolean, default: false },
    liquor: [{ type: mongoose.Schema.Types.ObjectId, ref: "Beverage" }]
}, { timestamps: true });

const PBFoodNet = mongoose.model("PBFoodNet", PBFoodNetSchema);
export default PBFoodNet;