import express from "express";
import { verifyTokenNotBlacklisted } from "../middleware/check-black-list-token.js";
import { authenticateToken } from "../middleware/verify-token.js";
import { addOrderToken, addTable, cancelOrder, getAllTables, getDailyOrdersSummary, getDailyRestaurantTotals, getHoldOrders, getOrderDetails, getOrderSummary, getTableById, selectTableForOrder, setInitialOrderDetails, updateOrderBillDetails, updateTable } from "../controllers/order-controller.js";
import { authorizeRoles } from "../middleware/role-authorize.js";
import { userRoles } from "../utils/enums/user-role.js";



const router = express.Router();

router.post(
  "/",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  setInitialOrderDetails
);

router.post(
  "/table",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  addTable
);

router.get(
  "/table",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  getAllTables
);

router.get(
  "/table/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  getTableById
);

router.patch(
  "/table/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  updateTable
);

router.patch(
  "/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  selectTableForOrder
);

router.patch(
  "/:id/token",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  addOrderToken
);

router.patch(
  "/:id/bill-details",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  updateOrderBillDetails
);


router.get(
  "/hold-orders",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  getHoldOrders
);

router.get(
  "/daily-summary",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  getDailyOrdersSummary
);

router.get(
  "/order-summary",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.SUPER_ADMIN.value,
  ]),
  getOrderSummary
);

router.get(
  "/:id",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  getOrderDetails
);

router.patch(
  "/:id/cancel",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  cancelOrder
);

router.get(
  "/restaurant/summary",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.SUPER_ADMIN.value,
    userRoles.BEACH_RESTAURANT_ADMIN.value,
    userRoles.POOL_RESTAURANT_ADMIN.value,
  ]),
  getDailyRestaurantTotals
);




export { router as orderRoutes }