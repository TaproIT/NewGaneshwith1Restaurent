import mongoose from "mongoose";

const extraBeverageCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true, collection: "extrabeveragecategories" }
);

// #TODO: Remove one of the unique indexes on 'name' to fix the warning.
// The problem is that you are defining the unique index on the name field in two different ways.

// Inline: unique: true inside the schema definition.

// Explicitly: extraBeverageCategorySchema.index({ name: 1 }, { unique: true });

// Mongoose sees both and creates the same index twice, which triggers the warning.
// extraBeverageCategorySchema.index({ name: 1 }, { unique: true });

const ExtraBeverageCategory = mongoose.model(
    "ExtraBeverageCategory",
    extraBeverageCategorySchema
);

export default ExtraBeverageCategory;
