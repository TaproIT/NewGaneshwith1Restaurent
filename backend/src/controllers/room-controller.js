import Room from "../models/Room.js";
import RoomCategory from "../models/roomCategory.js";

// Add new Room
export const addRoom = async (req, res) => {
    try {
        const { no, type, perDayPrice, facilities } = req.body;

        // Validate required fields
        if (!no || no.trim() === "") {
            return res.status(400).json({ message: "Room number cannot be null or empty." });
        }

        if (!type || !perDayPrice) {
            return res.status(400).json({ message: "Room type and per-day price are required." });
        }

        // Check if category exists
        const category = await RoomCategory.findById(type);
        if (!category) {
            return res.status(400).json({ message: "Invalid room category ID." });
        }

        // Check for duplicate room number
        const existingRoom = await Room.findOne({ no: no.trim() });
        if (existingRoom) {
            return res.status(400).json({ message: "Room number already exists." });
        }

        // Create new room
        const newRoom = new Room({
            no: no.trim(),
            type: category._id,
            perDayPrice,
            facilities: facilities || [],
        });

        await newRoom.save();
        res.status(201).json({ message: "Room added successfully.", room: newRoom });
    } catch (err) {
        console.error("Error adding room:", err);
        res.status(500).json({ message: "Server Error" });
    }
};



// Update existing Room (by ID or Room Number)
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params; // Can be ObjectId or room number
        const { no, type, perDayPrice, facilities, isBooked, isMaintenance } = req.body;

        // Find room either by MongoDB _id or room number
        let room = await Room.findById(id);
        if (!room) {
            room = await Room.findOne({ no: id }); // allow update by room number
        }

        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        }

        // If room number changed, ensure uniqueness
        if (no && no.trim() !== room.no) {
            const existingRoom = await Room.findOne({ no: no.trim() });
            if (existingRoom) {
                return res.status(400).json({ message: "Room number already exists." });
            }
            room.no = no.trim();
        }

        // Validate room category if provided
        if (type !== undefined) {
            const category = await RoomCategory.findById(type);
            if (!category) {
                return res.status(400).json({ message: "Invalid room category ID." });
            }
            room.type = category._id;
        }

        // Update other fields if provided
        if (perDayPrice !== undefined) room.perDayPrice = perDayPrice;
        if (facilities !== undefined) room.facilities = facilities;
        if (isBooked !== undefined) room.isBooked = isBooked;
        if (isMaintenance !== undefined) room.isMaintenance = isMaintenance;

        await room.save();
        res.status(200).json({ message: "Room updated successfully.", room });
    } catch (err) {
        console.error("Error updating room:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get all rooms
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find()
            .populate("type", "_id type") // populate category name & ID
            .sort({ createdAt: -1 });
        res.status(200).json(rooms);
    } catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get all available rooms
export const getAvailableAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isBooked: false })
            .populate("type", "_id type") // include category info
            .lean()
            .sort({ createdAt: -1 });
        res.status(200).json(rooms);
    } catch (err) {
        console.error("Error fetching available rooms:", err);
        res.status(500).json({ message: "Server Error" });
    }
};



// Room Category

// Create new Room Category
export const createRoomCategory = async (req, res) => {
    try {
        const { type } = req.body;

        if (!type || type.trim() === "") {
            return res.status(400).json({ message: "Category type is required." });
        }

        // Check if already exists
        const existing = await RoomCategory.findOne({ type: type.trim() });
        if (existing) {
            return res.status(400).json({ message: "Category already exists." });
        }

        const category = await RoomCategory.create({ type: type.trim() });
        return res.status(201).json({ message: "Category created successfully.", category });
    } catch (error) {
        console.error("Error creating room category:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

// Get all Room Categories
export const getAllRoomCategories = async (req, res) => {
    try {
        const categories = await RoomCategory.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching room categories:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

// Get Single Category by ID
export const getRoomCategoryById = async (req, res) => {
    try {
        const category = await RoomCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

// Update Category
export const updateRoomCategory = async (req, res) => {
    try {
        const { type } = req.body;

        if (!type || type.trim() === "") {
            return res.status(400).json({ message: "Category type is required." });
        }

        const existing = await RoomCategory.findOne({ type: type.trim() });
        if (existing && existing._id.toString() !== req.params.id) {
            return res.status(400).json({ message: "Category type already exists." });
        }

        const updated = await RoomCategory.findByIdAndUpdate(
            req.params.id,
            { type: type.trim() },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Category not found." });
        }

        res.status(200).json({ message: "Category updated successfully.", updated });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

//  Delete Category
export const deleteRoomCategory = async (req, res) => {
    try {
        const deleted = await RoomCategory.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Category not found." });
        }
        res.status(200).json({ message: "Category deleted successfully." });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};
