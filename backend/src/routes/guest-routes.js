import express from "express";
import { registerNewGuest } from "../controllers/guest-controller.js";
import { authenticateToken } from "../middleware/verify-token.js";
import { authorizeRoles } from "../middleware/role-authorize.js";
import { userRoles } from "../utils/enums/user-role.js";
import { verifyTokenNotBlacklisted } from "../middleware/check-black-list-token.js";

const router = express.Router();

router.post(
  "/register",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.RECEPTION.value, userRoles.SUPER_ADMIN.value, userRoles.ADMIN.value]),
  registerNewGuest
);

export { router as guestRoutes }
