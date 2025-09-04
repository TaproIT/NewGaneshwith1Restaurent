import express from "express";
import { verifyTokenNotBlacklisted } from "../middleware/check-black-list-token.js";
import { authenticateToken } from "../middleware/verify-token.js";
import { addOrderToken, selectTableForOrder, setInitialOrderDetails } from "../controllers/order-controller.js";
import { authorizeRoles } from "../middleware/role-authorize.js";
import { userRoles } from "../utils/enums/user-role.js";



const router = express.Router();

router.post(
  "/",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.ADMIN.value]),
  setInitialOrderDetails
);

router.post(
  "/:id/table",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.ADMIN.value]),
  selectTableForOrder
);

router.post(
  "/:id/token",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([userRoles.ADMIN.value]),
  addOrderToken
);



export { router as orderRoutes }