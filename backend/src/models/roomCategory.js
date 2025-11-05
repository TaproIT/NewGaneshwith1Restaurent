import mongoose from "mongoose";

const roomCategorySchema = new mongoose.Schema({
    type: { type: String, required: true },
}, { timestamps: true });

const RoomCategory = mongoose.model("RoomCategory", roomCategorySchema);
export default RoomCategory;
