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

router.post("/", createPBFoodNet);
router.get("/", getPBFoodNets);
router.get("/available",getAvailablePBFoodNets);
router.get("/:id", getPBFoodNet);
router.patch("/:id",updatePBFoodNet);
router.delete("/:id", deletePBFoodNet);
router.get("/:id/available", getAvailablePBFoodNet);

export { router as pbfoodnetRoutes }