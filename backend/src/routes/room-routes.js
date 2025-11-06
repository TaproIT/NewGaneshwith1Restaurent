import express from "express";
import {
    addRoom, createRoomCategory,
    deleteRoomCategory, getAllRoomCategories,
    getAllRooms,
    getAvailableAllRooms, getRoomCategoryById,
    updateRoom, updateRoomCategory
} from "../controllers/room-controller.js";

const router = express.Router();

// POST request to add a room
router.post("/", addRoom);
// GET request to fetch all available rooms
router.get("/available", getAvailableAllRooms);
// GET request to fetch all rooms
router.get("/", getAllRooms);
router.put("/update/:id", updateRoom);

// Category
router.post("/room-category", createRoomCategory);
router.get("/room-category", getAllRoomCategories);
router.get("/room-category/:id", getRoomCategoryById);
router.put("/room-category/:id", updateRoomCategory);
router.delete("/room-category/:id", deleteRoomCategory);

export { router as roomRoutes };
