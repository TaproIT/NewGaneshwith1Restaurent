import express from "express";
const router = express.Router();
import {
    createPBFoodNet,
    deletePBFoodNet, getAvailablePBFoodNet,
    getAvailablePBFoodNets,
    getPBFoodNet,
    getPBFoodNets,
    updatePBFoodNet
} from "../../controllers/PoolAndBeachResturant/pbfoodnetController.js";
import { verifyTokenNotBlacklisted } from "../../middleware/check-black-list-token.js";
import { authenticateToken } from "../../middleware/verify-token.js";
import { authorizeRoles } from "../../middleware/role-authorize.js";
import { userRoles } from "../../utils/enums/user-role.js";

router.post(
  "/",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
  ]),
  createPBFoodNet
);
router.get(
  "/",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
  ]),
  getPBFoodNets
);
router.get(
  "/available",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
  ]),
  getAvailablePBFoodNets
);
router.get("/:id", getPBFoodNet);
router.patch("/:id",updatePBFoodNet);
router.delete("/:id", deletePBFoodNet);
router.get("/:id/available", getAvailablePBFoodNet);

export { router as pbfoodnetRoutes }