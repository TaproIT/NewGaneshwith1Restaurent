import express from "express";
import { verifyTokenNotBlacklisted } from "../../middleware/check-black-list-token.js";
import { authenticateToken } from "../../middleware/verify-token.js";
import { registerNewUser } from "../../controllers/auth-controller.js";
import { authorizeRoles } from "../../middleware/role-authorize.js";
import { userRoles } from "../../utils/enums/user-role.js";

const router = express.Router();

router.post(
  "/create-user",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.ADMIN.value,
  ]),
  registerNewUser
);

export { router as adminRoutes }