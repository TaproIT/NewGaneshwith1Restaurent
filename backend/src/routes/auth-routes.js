import express from "express";
import { loginUser, registerNewUser } from "../controllers/auth-controller.js";
import { authenticateToken } from "../middleware/verify-token.js";

const router = express.Router();

router.post("/register", registerNewUser);

router.post("/login", authenticateToken, loginUser);

export { router as authRoutes }