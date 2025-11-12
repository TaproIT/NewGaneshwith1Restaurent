// services/beverageService.js
import dayjs from "dayjs";
import Beverage from "../models/Beverage/beverage.js";

export const updateBeverageQuantityManually = async (id, quantity, note = "") => {
    if (!quantity || quantity <= 0) {
        return { success: false, message: "Quantity must be greater than 0." };
    }

    const beverage = await Beverage.findById(id);
    if (!beverage || beverage.status === "deleted") {
        return { success: false, message: "Beverage not found or deleted." };
    }

    if (beverage.runningStock < quantity) {
        return { success: false, message: "Not enough stock to reduce." };
    }

    const now = dayjs();
    const formattedNote = `${now.format("YYYY-MM-DD HH:mm:ss")} - ${note || "Manual reduction"}`;

    const oldStock = beverage.runningStock;
    const newStock = oldStock - quantity;

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

    beverage.runningStock = newStock;
    beverage.lastUpdateAt = now.toDate();
    beverage.historyQuantity.push(historyEntry);

    return await beverage.save();
};


export const updateBeverageVolumeManually = async (id, volume, note = "") => {
    if (!volume || volume <= 0) {
        throw new Error("Volume must be greater than 0.");
    }

    const beverage = await Beverage.findById(id);
    if (!beverage || beverage.status === "deleted") {
        throw new Error("Beverage not found or deleted.");
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
    return await beverage.save();
};
