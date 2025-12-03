import mongoose from "mongoose";

const currencyValueSchema = new mongoose.Schema(
    {
        // Required values you want to save
        usd: { type: Number, required: true, min: 0 },
        eur: { type: Number, required: true, min: 0 },

        // When this set of values becomes effective (defaults to now)
        effectiveAt: { type: Date, required: true, default: Date.now },

        // Optional metadata
        note: { type: String, trim: true },
        updatedBy: { type: String, trim: true }
    },
    { timestamps: true }
);

currencyValueSchema.index({ effectiveAt: -1 }); // fast "latest" lookups

const CurrencyValue = mongoose.model("CurrencyValue", currencyValueSchema);
export default CurrencyValue;
