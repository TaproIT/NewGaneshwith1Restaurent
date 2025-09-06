import express from "express";
const router = express.Router();
import {
    // updateCategory,
    updatePBFoodNet,
    // deleteCategory,
    deletePBFoodNet,
    // createCategory,
    createPBFoodNet,
    // getCategory, 
    getPBFoodNet,
    // getCategories, 
    getPBFoodNets,
    // getAvailableCategories
    getAvailablePBFoodNets
} from "../../controllers/PoolAndBeachResturant/pbfoodnetCategoryController.js";

router.post("/", createPBFoodNet);
router.put("/:id", updatePBFoodNet);
router.delete("/:id", deletePBFoodNet);
router.get("/", getPBFoodNets)
router.get("/available", getAvailablePBFoodNets);
router.get("/:id",getPBFoodNet)

export { router as pbfoodnetCategoryRoutes }

