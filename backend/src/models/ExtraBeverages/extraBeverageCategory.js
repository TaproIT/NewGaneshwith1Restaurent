import mongoose from "mongoose";

import { RestaurantTypes } from "../../utils/enums/order-related-enums.js";

const extraBeverageCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        isVisible: { type: Boolean, default: true },
        restaurantType: { type: String, required: true, enum: [RestaurantTypes.RESTAURANT.value], default: RestaurantTypes.RESTAURANT.value },
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
