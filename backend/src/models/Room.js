import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    no: { type: String, unique: true, required: [true, 'Room number is required.'] },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoomCategory",
        required: true
    },
    currency: {
        type: String,
        enum: ["LKR", "USD", "EUR"],
        default: "LKR"
    },
    perDayPrice: { type: Number, required: true },
    facilities: [{ type: String }],
    isBooked: { type: Boolean, default: false },
    isMaintenance: {type: Boolean, default: false }
}, { timestamps: true }); 

const Room = mongoose.model("Room", roomSchema);
export default Room;
