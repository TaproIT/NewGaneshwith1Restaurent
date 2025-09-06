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

const router = express.Router();

// Create
router.post("/", createBeverage);

// Read
router.get("/", getAllBeverages);
router.get("/categories/summary", getCategorySummary);
router.get("/:id", getOneBeverage);

// Update (supports modes: edit | restock | remove | purchase)
router.patch("/:id", updateBeverage);

// Soft delete
router.delete("/:id", deleteBeverage);

export { router as beverageRoutes }
