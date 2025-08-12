import express from "express";
import { getAllUsers } from "../controllers/user-controller.js";
import { authenticateToken } from "../middleware/verify-token.js";
import { authorizeRoles } from "../middleware/role-authorize.js";
import { userRoles } from "../utils/enums/user-role.js";


const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles([userRoles.SUPER_ADMIN.value]),
  getAllUsers
);

export { router as userRoutes }