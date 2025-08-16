import express from "express";
import { addRoom, getAllRooms } from "../controllers/room-controller.js";

const router = express.Router();

// POST request to add a room
router.post("/", addRoom);

// GET request to fetch all rooms (for testing purposes)
router.get("/", getAllRooms);

export { router as roomRoutes };
