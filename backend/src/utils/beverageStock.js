// utils/beverageStock.js
import Beverage from "../models/Beverage/beverage.js";

const yyyymmFromDate = (d = new Date()) => ({
    year: d.getFullYear(),
    month: d.getMonth() + 1,
});

const findHistoryIndex = (bev, year, month) =>
    (bev.history || []).findIndex((h) => h.year === year && h.month === month);

const getPrevClosing = (bev, year, month) => {
    const key = year * 100 + month;
    let carry = 0;
    let latestKey = -1;
    for (const h of bev.history || []) {
        const k = h.year * 100 + h.month;
        if (k < key && k > latestKey) {
            latestKey = k;
            carry = h.availableAfterPurchases ?? 0;
        }
    }
    return carry;
};

const ensureMonthEntry = (bev, year, month) => {
    let idx = findHistoryIndex(bev, year, month);
    if (idx === -1) {
        const opening = getPrevClosing(bev, year, month) || 0;
        bev.history.push({
            year,
            month,
            lastUpdateAt: new Date(),
            openingStock: opening,
            totalRestocked: 0,
            totalRemoved: 0,
            totalPurchased: 0,
            totalInStock: opening,
            availableAfterPurchases: opening,
            restockEvents: [],
            removalEvents: [],
            purchaseEvents: [],
        });
        idx = bev.history.length - 1;
    }
    return bev.history[idx];
};

const recomputeMonthlyTotals = (bev, hist) => {
    if (hist.openingStock === undefined || hist.openingStock === null) {
        hist.openingStock = getPrevClosing(bev, hist.year, hist.month) || 0;
    }
    hist.totalRestocked = (hist.restockEvents || []).reduce((s, e) => s + (e.quantity || 0), 0);
    hist.totalRemoved = (hist.removalEvents || []).reduce((s, e) => s + (e.quantity || 0), 0);
    hist.totalPurchased = (hist.purchaseEvents || []).reduce((s, e) => s + (e.quantity || 0), 0);

    hist.totalInStock = Math.max(0, (hist.openingStock || 0) + hist.totalRestocked - hist.totalRemoved);
    hist.availableAfterPurchases = Math.max(0, hist.totalInStock - hist.totalPurchased);
    hist.lastUpdateAt = new Date();
};

// const beverage = await purchaseBeverageById(id, quantity, note);
export async function purchaseBeverageById(id, quantity, note) {
    const q = Number(quantity) || 0;
    if (q <= 0) throw new Error("quantity must be > 0");

    const bev = await Beverage.findById(id);
    if (!bev || bev.status === "deleted") throw new Error("Beverage not found");

    const current = Number(bev.runningStock || 0);
    if (current - q < 0) throw new Error("Insufficient stock to record purchase");

    const now = new Date();
    const { year, month } = yyyymmFromDate(now);

    const hist = ensureMonthEntry(bev, year, month);

    bev.runningStock = current - q;
    hist.purchaseEvents.push({ quantity: q, date: now, note });

    recomputeMonthlyTotals(bev, hist);
    bev.currentMonthStock = hist.totalInStock;
    bev.currentMonthAvailable = hist.availableAfterPurchases;
    bev.lastUpdateAt = now;

    await bev.save();
    return bev;
}
