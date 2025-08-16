import Room from "../models/Room.js";

export const addRoom = async (req, res) => {
    try {
        const { number, type, price, facilities } = req.body;

        if (!number || !type || !price) {
            return res.status(400).json({ message: "Room number, type, and price are required." });
        }

        const existingRoom = await Room.findOne({ number });
        if (existingRoom) {
            return res.status(400).json({ message: "Room number already exists." });
        }

        const newRoom = new Room({
            number,
            type,
            price,
            facilities: facilities || [],
        });

        await newRoom.save();

        res.status(201).json({ message: "Room added successfully", room: newRoom });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
