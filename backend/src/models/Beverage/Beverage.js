import mongoose from "mongoose";

const BeverageSchema = new mongoose.Schema({
    beverageName: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
        type: String,
        enum: ["Hard Liquor", "Soft Drinks", "Cola Drinks"],
        required: true
    },
    isVisible: { type: Boolean, default: true }
}, { timestamps: true });

const Beverage = mongoose.model("Beverage", BeverageSchema);

export default Beverage;