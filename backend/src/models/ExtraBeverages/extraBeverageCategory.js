import mongoose from "mongoose";

const extraBeverageCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true, collection: "extrabeveragecategories" }
);

extraBeverageCategorySchema.index({ name: 1 }, { unique: true });

const ExtraBeverageCategory = mongoose.model(
    "ExtraBeverageCategory",
    extraBeverageCategorySchema
);

export default ExtraBeverageCategory;
