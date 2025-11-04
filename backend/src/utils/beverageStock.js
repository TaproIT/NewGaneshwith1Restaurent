// controllers/beverageController.js
import dayjs from "dayjs";
import Beverage from "../models/Beverage/beverage.js";

export const manualUpdateQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, note } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0.",
            });
        }

        const beverage = await Beverage.findById(id);
        if (!beverage || beverage.status === "deleted") {
            return res.status(404).json({
                success: false,
                message: "Beverage not found or deleted.",
            });
        }

        if (beverage.runningStock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Not enough stock to reduce.",
            });
        }

        const now = dayjs();
        const formattedNote = `${now.format("YYYY-MM-DD HH:mm:ss")} - ${note || "Manual reduction"}`;

        const oldStock = beverage.runningStock;
        const newStock = oldStock - quantity;

        // Prepare new history entry
        const historyEntry = {
            year: now.year(),
            month: now.month() + 1,
            lastUpdateAt: now.toDate(),
            oldStock,
            purchasedStock: quantity,
            isPurchased: true,
            newStock,
            date: now.toDate(),
            note: formattedNote,
        };

        // Update beverage
        beverage.runningStock = newStock;
        beverage.lastUpdateAt = now.toDate();
        beverage.historyQuantity.push(historyEntry);

        const updatedBeverage = await beverage.save();

        res.status(200).json({
            success: true,
            message: "Beverage quantity updated manually.",
            data: updatedBeverage,
        });
    } catch (error) {
        console.error("Error updating beverage quantity:", error);
        res.status(500).json({
            success: false,
            message: "Failed to manually update beverage quantity.",
            error: error.message,
        });
    }
};

export const manualUpdateFoodVolume = async (req, res) => {
    try {
        const { id } = req.params;
        const { volume, note } = req.body;

        if (!volume || volume <= 0) {
            return res.status(400).json({
                success: false,
                message: "Volume must be greater than 0.",
            });
        }

        const beverage = await Beverage.findById(id);
        if (!beverage || beverage.status === "deleted") {
            return res.status(404).json({
                success: false,
                message: "Beverage not found or deleted.",
            });
        }

        const now = dayjs();
        const formattedNote = `${now.format("YYYY-MM-DD HH:mm:ss")} - ${note || "Manual volume update"}`;

        const volumeEntry = {
            volume,
            year: now.year(),
            month: now.month() + 1,
            date: now.toDate(),
            note: formattedNote,
        };

        beverage.historyVolumeForPBFoodNet.push(volumeEntry);

        const updatedBeverage = await beverage.save();

        res.status(200).json({
            success: true,
            message: "Beverage volume history updated manually.",
            data: updatedBeverage,
        });
    } catch (error) {
        console.error("Error updating beverage volume:", error);
        res.status(500).json({
            success: false,
            message: "Failed to manually update beverage volume.",
            error: error.message,
        });
    }
};
