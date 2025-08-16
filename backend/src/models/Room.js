import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    number: { type: String, unique: true, required: true }, // unique room number
    type: { type: String, required: true },
    price: { type: Number, required: true },
    facilities: [{ type: String }],
    isBooked: { type: Boolean, default: false }
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);
export default Room;
