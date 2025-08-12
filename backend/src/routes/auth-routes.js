import express from "express";
import { loginUser, logoutUser, registerNewUser } from "../controllers/auth-controller.js";
import { authenticateToken } from "../middleware/verify-token.js";
import { verifyTokenNotBlacklisted } from "../middleware/check-black-list-token.js";

const router = express.Router();

router.post("/register", registerNewUser);

router.post("/login",  verifyTokenNotBlacklisted, authenticateToken, loginUser);

router.post("/logout", verifyTokenNotBlacklisted, authenticateToken, logoutUser);

export { router as authRoutes }