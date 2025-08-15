import express from "express";
import { forgotPassword, loginUser, logoutUser, refreshUserTokens, registerNewUser, resetPassword } from "../controllers/auth-controller.js";
import { authenticateToken } from "../middleware/verify-token.js";
import { verifyTokenNotBlacklisted } from "../middleware/check-black-list-token.js";

const router = express.Router();

router.post("/register", registerNewUser);

router.post("/login", loginUser);

router.post("/logout", verifyTokenNotBlacklisted, authenticateToken, logoutUser);

router.post("/refresh-token", verifyTokenNotBlacklisted, refreshUserTokens);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

export { router as authRoutes }