import express from "express";
import { verifyTokenNotBlacklisted } from "../../middleware/check-black-list-token.js";
import { authenticateToken } from "../../middleware/verify-token.js";
import { registerNewUser } from "../../controllers/auth-controller.js";
import { authorizeRoles } from "../../middleware/role-authorize.js";
import { userRoles } from "../../utils/enums/user-role.js";
import { activateUserById, deleteUserById, getAllUsers, getUserById } from "../../controllers/user-controller.js";

const router = express.Router();

router.post(
  "/create-user",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
  ]),
  registerNewUser
);

router.get(
  "/get-users",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
  ]),
  getAllUsers
);

router.get(
  "/get-user/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
  ]),
  getUserById
);

router.patch(
  "/deactivate-user/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
  ]),
  deleteUserById
);

router.patch(
  "/activate-user/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
  ]),
  activateUserById
);

export { router as adminRoutes }