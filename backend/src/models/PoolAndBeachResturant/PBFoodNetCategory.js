import mongoose from  "mongoose";

const PBFoodNetCategorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true, unique: true },
    isVisible: { type: Boolean, default: true }
}, { timestamps: true });

const PBFoodNetCategory = mongoose.model("PBFoodNetCategory", PBFoodNetCategorySchema);
export default PBFoodNetCategory;
