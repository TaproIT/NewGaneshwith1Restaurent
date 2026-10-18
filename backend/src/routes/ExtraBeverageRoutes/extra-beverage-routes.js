import express from "express";
import {
    createExtraBeverage,
    createExtraBeverageCategory, deleteExtraBeverage,
    deleteExtraBeverageCategory, getAvailableExtraBeverageCategories, getAvailableExtraBeverages, getExtraBeverage,
    getExtraBeverageCategory,
    listExtraBeverageCategories,
    listExtraBeverages,
    toggleExtraBeverageCategoryVisibility, toggleExtraBeverageVisibility,
    updateExtraBeverage,
    updateExtraBeverageCategory
} from "../../controllers/ExtraBeverage/extra-beverage-controller.js";
import { verifyTokenNotBlacklisted } from "../../middleware/check-black-list-token.js";
import { authenticateToken } from "../../middleware/verify-token.js";
import { authorizeRoles } from "../../middleware/role-authorize.js";
import { userRoles } from "../../utils/enums/user-role.js";


const router = express.Router();

// Category
router.post(
  "/category",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.ADMIN.value,
    userRoles.RESTAURANT_ADMIN.value,
  ]),
  createExtraBeverageCategory
);
router.get(
  "/available/category",
  verifyTokenNotBlacklisted,
  authenticateToken,
  authorizeRoles([
    userRoles.RESTAURANT_STAFF.value,
    userRoles.ADMIN.value,
    userRoles.RESTAURANT_ADMIN.value,
  ]),
  getAvailableExtraBeverageCategories
);
router.get("/category", listExtraBeverageCategories);
router.get("/category/:id", getExtraBeverageCategory);
router.put("/category/:id", updateExtraBeverageCategory);
router.delete("/category/:id", deleteExtraBeverageCategory);
router.patch("/category/:id/toggle-visibility", toggleExtraBeverageCategoryVisibility);


// beverages
router.get("/available",getAvailableExtraBeverages)
router.post("/", createExtraBeverage);
router.get("/", listExtraBeverages);
router.get("/:id", getExtraBeverage);
router.put("/:id", updateExtraBeverage);
router.delete("/:id", deleteExtraBeverage);
router.patch("/:id/toggle-visibility", toggleExtraBeverageVisibility);


export default router;
