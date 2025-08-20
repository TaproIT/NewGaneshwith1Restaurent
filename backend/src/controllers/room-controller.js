import Room from "../models/Room.js";

// Add a new room
export const addRoom = async (req, res) => {
    try {
        const { no, type, perDayPrice, facilities } = req.body;
        if (!no || no.trim() === '') {
            return res.status(400).json({ message: "Room number cannot be null or empty." });
        }

        if (!type || !perDayPrice) {
            return res.status(400).json({ message: "Room type and price are required." });
        }

        const existingRoom = await Room.findOne({ no });
        if (existingRoom) {
            return res.status(400).json({ message: "Room number already exists." });
        }
        const newRoom = new Room({
            no,
            type,
            perDayPrice,
            facilities: facilities || [],
        });

        await newRoom.save();
        res.status(201).json({ message: "Room added successfully", room: newRoom });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};


// Get all rooms
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

//Get Available Rooms
export const getAvailableAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({
            isBooked: true,
        }).lean();
        res.status(200).json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
