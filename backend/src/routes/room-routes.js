import express from "express";
import {addRoom, getAllRooms, getAvailableAllRooms} from "../controllers/room-controller.js";

const router = express.Router();

// POST request to add a room
router.post("/", addRoom);

// GET request to fetch all available rooms
router.get("/available", getAvailableAllRooms);

// GET request to fetch all rooms
router.get("/", getAllRooms);

export { router as roomRoutes };
