import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import CurrencyValue from "../models/currency-value.js";
dayjs.extend(utc);
dayjs.extend(timezone);


const HOTEL_TZ = "Asia/Colombo";

/**
 * Create or update today's currency values (upsert by start-of-day in hotel TZ).
 * POST body: { lkr: Number, usd: Number, note?: String, updatedBy?: String }
 */
export const upsertTodayCurrencyValues = async (req, res) => {
    try {
        const { lkr, usd, note, updatedBy } = req.body;
        if (lkr === undefined || usd === undefined) {
            return res.status(400).json({ success: false, error: "lkr and usd are required" });
        }

        const startOfToday = dayjs().tz(HOTEL_TZ).startOf("day").toDate();
        const endOfToday = dayjs(startOfToday).add(1, "day").toDate();

        // Upsert a single record for "today"
        const doc = await CurrencyValue.findOneAndUpdate(
            { effectiveAt: { $gte: startOfToday, $lt: endOfToday } },
            { lkr, usd, note, updatedBy, effectiveAt: new Date() },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();

        return res.status(200).json({ success: true, data: doc });
    } catch (err) {
        console.error("upsertTodayCurrencyValues error:", err);
        return res.status(500).json({ success: false, error: "Failed to save currency values" });
    }
};

/**
 * Get the most recent currency values
 * GET /latest
 */
export const getLatestCurrencyValues = async (_req, res) => {
    try {
        const doc = await CurrencyValue.findOne().sort({ effectiveAt: -1 }).lean();
        if (!doc) return res.status(404).json({ success: false, error: "No currency values found" });
        return res.json({ success: true, data: doc });
    } catch (err) {
        console.error("getLatestCurrencyValues error:", err);
        return res.status(500).json({ success: false, error: "Failed to fetch latest currency values" });
    }
};

/**
 * List currency values with optional date range (hotel TZ)
 * GET /?from=YYYY-MM-DD&to=YYYY-MM-DD
 * If none supplied, returns last 30 days.
 */
export const listCurrencyValues = async (req, res) => {
    try {
        const { from, to } = req.query;

        let start = from
            ? dayjs.tz(from, "YYYY-MM-DD", HOTEL_TZ).startOf("day")
            : dayjs().tz(HOTEL_TZ).startOf("day").subtract(30, "day");

        let end = to
            ? dayjs.tz(to, "YYYY-MM-DD", HOTEL_TZ).endOf("day")
            : dayjs().tz(HOTEL_TZ).endOf("day");

        const docs = await CurrencyValue.find({
            effectiveAt: { $gte: start.toDate(), $lte: end.toDate() },
        })
            .sort({ effectiveAt: -1 })
            .lean();

        return res.json({ success: true, data: docs });
    } catch (err) {
        console.error("listCurrencyValues error:", err);
        return res.status(500).json({ success: false, error: "Failed to fetch currency values" });
    }
};

/**
 * Get by ID
 */
export const getCurrencyValueById = async (req, res) => {
    try {
        const doc = await CurrencyValue.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ success: false, error: "Not found" });
        return res.json({ success: true, data: doc });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};

/**
 * Update by ID (full or partial)
 * PUT body: { lkr?, usd?, note?, effectiveAt?, updatedBy? }
 */
export const updateCurrencyValueById = async (req, res) => {
    try {
        const { lkr, usd, note, effectiveAt, updatedBy } = req.body;
        const update = {
            ...(lkr !== undefined && { lkr }),
            ...(usd !== undefined && { usd }),
            ...(note !== undefined && { note }),
            ...(effectiveAt && { effectiveAt: new Date(effectiveAt) }),
            ...(updatedBy !== undefined && { updatedBy }),
        };

        const doc = await CurrencyValue.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        }).lean();

        if (!doc) return res.status(404).json({ success: false, error: "Not found" });
        return res.json({ success: true, data: doc });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};

/**
 * Delete by ID (optional)
 */
export const deleteCurrencyValueById = async (req, res) => {
    try {
        const doc = await CurrencyValue.findByIdAndDelete(req.params.id).lean();
        if (!doc) return res.status(404).json({ success: false, error: "Not found" });
        return res.json({ success: true, message: "Deleted" });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};
