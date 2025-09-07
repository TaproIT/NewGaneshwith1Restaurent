import express from "express";
const router = express.Router();
import {
    updateCategory,
    deleteCategory,
    createCategory,
    getCategory, getCategories, getAvailableCategories
} from "../../controllers/PoolAndBeachResturant/pbfoodnetCategoryController.js";

router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.get("/", getCategories)
router.get("/available", getAvailableCategories);
router.get("/:id",getCategory)

export { router as pbfoodnetCategoryRoutes }