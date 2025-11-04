// models/Beverage.js
import mongoose from "mongoose";
import { RestaurantTypes } from "../../utils/enums/order-related-enums.js";

const MonthlyFoodVolumeHistorySchema = new mongoose.Schema(
  {
    volume: { type: Number, required: true, min: 0 },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const MonthlyQuantityHistorySchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 }, // 1..12
    lastUpdateAt: { type: Date, default: Date.now },

    oldStock: { type: Number, default: 0 },
    purchasedStock: { type: Number, default: 0 },
    isPurchased: { type: Boolean, default: false },
    newStock: { type: Number, default: 0 },

    date: { type: Date, default: Date.now },
    note: { type: String },

  },
  { _id: false }
);

const BeverageSchema = new mongoose.Schema(
  {
    beverageName: { type: String, required: true },
    price: { type: Number, required: true },
    runningStock: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ["hard liquor", "soft drinks"],
      required: true,
    },
      volume: {type:Number,default:0},
    //restaurantType: { type: String, required: true, enums: [RestaurantTypes.BEACH.value, RestaurantTypes.POOL.value] },
    isVisible: { type: Boolean, default: true },

    // NEW: soft-delete and lifecycle
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
      index: true,
    },
    deletedAt: { type: Date },
    lastUpdateAt: { type: Date },

    // NEW: month-by-month history
    historyQuantity: [MonthlyQuantityHistorySchema],
    historyVolumeForPBFoodNet: [MonthlyFoodVolumeHistorySchema],
  },
  { timestamps: true }
);

// helpful index for fast month lookups
BeverageSchema.index({ "history.year": 1, "history.month": 1 });

const Beverage = mongoose.model("Beverage", BeverageSchema);
export default Beverage;
