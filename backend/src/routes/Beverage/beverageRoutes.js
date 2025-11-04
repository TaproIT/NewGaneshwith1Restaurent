// routes/beverageRoutes.js
import express from "express";
import {
  createBeverage,
  getAllBeverages,
  getOneBeverage,
  updateBeverage,
  deleteBeverage,
  getCategorySummary,
} from "../../controllers/Beverage/beverageController.js";
import { verifyTokenNotBlacklisted } from "../../middleware/check-black-list-token.js";
import { authenticateToken } from "../../middleware/verify-token.js";
import { userRoles } from "../../utils/enums/user-role.js";
import { authorizeRoles } from "../../middleware/role-authorize.js";

const router = express.Router();

// Create
router.post("/", createBeverage);

// Read
router.get(
  "/",
  // verifyTokenNotBlacklisted,
  // authenticateToken,
  // authorizeRoles([
  //   userRoles.BEACH_RESTAURANT_STAFF.value,
  //   userRoles.POOL_RESTAURANT_STAFF.value,
  //   userRoles.ADMIN.value,
  //   userRoles.SUPER_ADMIN.value
  // ]),
  getAllBeverages
);

router.get("/categories/summary", getCategorySummary);
router.get("/:id", getOneBeverage);

// Update (supports modes: edit | restock | remove | purchase)
router.patch("/:id", updateBeverage);

// Soft delete
router.delete("/:id", deleteBeverage);

export { router as beverageRoutes }
