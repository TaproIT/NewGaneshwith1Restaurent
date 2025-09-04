import express from "express";
import { getAllUsers, getUserRole } from "../controllers/user-controller.js";
import { authenticateToken } from "../middleware/verify-token.js";
import { authorizeRoles } from "../middleware/role-authorize.js";
import { userRoles } from "../utils/enums/user-role.js";
import { verifyTokenNotBlacklisted } from "../middleware/check-black-list-token.js";


const router = express.Router();

router.get(
  "/",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.SUPER_ADMIN.value]),
  getAllUsers
);

router.get(
  "/user-role",
  verifyTokenNotBlacklisted,
  authenticateToken,
  getUserRole
);

export { router as userRoutes }