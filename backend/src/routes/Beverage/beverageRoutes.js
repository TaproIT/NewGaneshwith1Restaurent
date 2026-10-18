// routes/beverageRoutes.js
import express from "express";
import {
    createBeverage,
    getAllBeverages,
    getOneBeverage,
    deleteBeverage,
    getCategorySummary,
    updateBeveragePriceAndVolume,
    reduceBeverageQuantity,
    addBeverageQuantity,
    getAllBeveragesWithMinimalDetails,
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
  //   userRoles.RESTAURANT_STAFF.value,
  //   userRoles.ADMIN.value,
  //   userRoles.SUPER_ADMIN.value
  // ]),
  getAllBeverages
);
router.get("/special/details",getAllBeveragesWithMinimalDetails);
router.get("/categories/summary", getCategorySummary);
router.get("/:id", getOneBeverage);


router.put("/price-and-volume/:id", updateBeveragePriceAndVolume);

router.put("/reduce-beverage-quantity/:id", reduceBeverageQuantity);

router.put("/add-beverage-quantity/:id", addBeverageQuantity);

// Soft delete
router.delete("/:id", deleteBeverage);

export { router as beverageRoutes }
