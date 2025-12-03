import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    dateKey: { type: String, unique: true, required: true },
    sequenceValue: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
export default Counter;
