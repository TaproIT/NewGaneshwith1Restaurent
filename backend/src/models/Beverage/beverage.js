// models/Beverage.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    quantity: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const MonthlyHistorySchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },            // e.g., 2025
    month: { type: Number, required: true, min: 1, max: 12 }, // 1..12
    lastUpdateAt: { type: Date, default: Date.now },

    // rollup numbers for the month
    openingStock: { type: Number, default: 0 },
    totalRestocked: { type: Number, default: 0 },
    totalRemoved: { type: Number, default: 0 },        // non-sale removals (waste, lost, etc.)
    totalPurchased: { type: Number, default: 0 },      // sold/used for purchases

    // computed balances
    totalInStock: { type: Number, default: 0 },        // opening + restocked - removed
    availableAfterPurchases: { type: Number, default: 0 }, // totalInStock - purchased

    // detailed events
    restockEvents: [EventSchema],   
    removalEvents: [EventSchema],   
    purchaseEvents: [EventSchema],  
  },
  { _id: false }
);

const BeverageSchema = new mongoose.Schema(
  {
    beverageName: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ["hard liquor", "soft drinks"],
      required: true,
    },
    isVisible: { type: Boolean, default: true },

    // NEW: soft-delete and lifecycle
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
      index: true,
    },
    deletedAt: { type: Date },

    // NEW: running/derived fields
    runningStock: { type: Number, default: 0 },             // current absolute stock
    currentMonthStock: { type: Number, default: 0 },        // this month's totalInStock
    currentMonthAvailable: { type: Number, default: 0 },    // this month's availableAfterPurchases
    lastUpdateAt: { type: Date },

    // NEW: month-by-month history
    history: [MonthlyHistorySchema],
  },
  { timestamps: true }
);

// helpful index for fast month lookups
BeverageSchema.index({ "history.year": 1, "history.month": 1 });

const Beverage = mongoose.model("Beverage", BeverageSchema);
export default Beverage;
