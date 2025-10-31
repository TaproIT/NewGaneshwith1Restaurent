import express from "express";
import {
    deleteCurrencyValueById,
    getCurrencyValueById,
    getLatestCurrencyValues,
    listCurrencyValues, updateCurrencyValueById,
    upsertTodayCurrencyValues
} from "../controllers/currency-value-controller.js";


const router = express.Router();

// Create/Update today's values (upsert)
router.post("/", upsertTodayCurrencyValues);

// Latest single record
router.get("/latest", getLatestCurrencyValues);

// List (optionally by date range)
router.get("/", listCurrencyValues);

// By ID
router.get("/:id", getCurrencyValueById);
router.put("/:id", updateCurrencyValueById);
router.delete("/:id", deleteCurrencyValueById);

export default router;
