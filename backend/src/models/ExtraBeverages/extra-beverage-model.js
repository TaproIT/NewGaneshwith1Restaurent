import mongoose from "mongoose";

const extraBeverageSchema = new mongoose.Schema(
    {
        beverageName: { type: String, required: true, trim: true },
        extraBeverageCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExtraBeverageCategory",
            required: true,
        },
        price: { type: Number, required: true, min: 0 },
        isVisible: { type: Boolean, default: true },
        isEnableBeverage: { type: Boolean, default: false},
        liquor: [
            {
                beverage: { type: mongoose.Schema.Types.ObjectId, ref: "Beverage", required: true },
                amount: { type: Number, default: 0 },
            },
        ],
    },
    { timestamps: true, collection: "extrabeverages" }
);

extraBeverageSchema.index({ beverageName: 1 });
extraBeverageSchema.index({ extraBeverageCategory: 1, isVisible: 1 });

const ExtraBeverage = mongoose.model("ExtraBeverage", extraBeverageSchema);

export default ExtraBeverage;
