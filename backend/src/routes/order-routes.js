import express from "express";
import { verifyTokenNotBlacklisted } from "../middleware/check-black-list-token.js";
import { authenticateToken } from "../middleware/verify-token.js";
import { addOrderToken, addTable, getAllTables, getOrderDetails, getTableById, selectTableForOrder, setInitialOrderDetails, updateTable } from "../controllers/order-controller.js";
import { authorizeRoles } from "../middleware/role-authorize.js";
import { userRoles } from "../utils/enums/user-role.js";



const router = express.Router();

router.post(
  "/",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.BEACH_RESTAURANT_STAFF.value, userRoles.ADMIN.value]),
  setInitialOrderDetails
);

router.post(
  "/table",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.BEACH_RESTAURANT_STAFF.value,userRoles.ADMIN.value]),
  addTable
);

router.get(
  "/table",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.BEACH_RESTAURANT_STAFF.value,userRoles.ADMIN.value]),
  getAllTables
);

router.get(
  "/table/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.BEACH_RESTAURANT_STAFF.value,userRoles.ADMIN.value]),
  getTableById
);

router.patch(
  "/table/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.BEACH_RESTAURANT_STAFF.value, userRoles.ADMIN.value]),
  updateTable
);

router.patch(
  "/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.BEACH_RESTAURANT_STAFF.value,userRoles.ADMIN.value]),
  selectTableForOrder
);

router.post(
  "/:id/token",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.ADMIN.value]),
  addOrderToken
);

router.get(
  "/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.BEACH_RESTAURANT_STAFF.value, userRoles.ADMIN.value]),
  getOrderDetails
)


export { router as orderRoutes }