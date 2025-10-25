import express from "express";
const router = express.Router();
import {
    updateCategory,
    deleteCategory,
    createCategory,
    getCategory, getCategories, getAvailableCategories
} from "../../controllers/PoolAndBeachResturant/pbfoodnetCategoryController.js";
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
  createCategory
);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.get(
  "/",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
  ]),
  getCategories
);
router.get(
  "/available",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.BEACH_RESTAURANT_STAFF.value,
    userRoles.POOL_RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
  ])
);
router.get("/:id",getCategory)

export { router as pbfoodnetCategoryRoutes }