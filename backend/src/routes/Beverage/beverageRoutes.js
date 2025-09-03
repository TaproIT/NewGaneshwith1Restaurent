import express from "express";
const router = express.Router();
import {
    createBeverage,
    deleteBeverage,
    updateBeverage
} from "../../controllers/Beverage/beverageController.js";

router.post("/", createBeverage);
router.put("/:id", updateBeverage);
router.delete("/:id", deleteBeverage);

export { router as beverageRoutes }