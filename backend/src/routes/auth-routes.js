import express from "express";
import { registerNewUser } from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/register", registerNewUser);

export { router as authRoutes }