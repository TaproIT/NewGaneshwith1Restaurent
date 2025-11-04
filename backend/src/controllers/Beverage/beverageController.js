// controllers/beverageController.js
import Beverage from "../../models/Beverage/beverage.js";

import dayjs from "dayjs";


// helpers
const yyyymmFromDate = (d = new Date()) => ({
  year: d.getFullYear(),
  month: d.getMonth() + 1,
});

const samePeriod = (a, b) => a.year === b.year && a.month === b.month;

const findHistoryIndex = (bev, year, month) =>
  bev.history.findIndex((h) => h.year === year && h.month === month);

const getPrevClosing = (bev, year, month) => {
  const key = year * 100 + month;
  let carry = 0;
  let latestKey = -1;
  for (const h of bev.history) {
    const k = h.year * 100 + h.month;
    if (k < key && k > latestKey) {
      latestKey = k;
      carry = h.availableAfterPurchases ?? 0;
    }
  }
  return carry;
};

const recomputeMonthlyTotals = (bev, hist) => {
  if (hist.openingStock === undefined || hist.openingStock === null) {
    hist.openingStock = getPrevClosing(bev, hist.year, hist.month) || 0;
  }

  hist.totalRestocked = (hist.restockEvents || []).reduce(
    (s, e) => s + (e.quantity || 0),
    0
  );
  hist.totalRemoved = (hist.removalEvents || []).reduce(
    (s, e) => s + (e.quantity || 0),
    0
  );
  hist.totalPurchased = (hist.purchaseEvents || []).reduce(
    (s, e) => s + (e.quantity || 0),
    0
  );

  hist.totalInStock = Math.max(
    0,
    (hist.openingStock || 0) + hist.totalRestocked - hist.totalRemoved
  );
  hist.availableAfterPurchases = Math.max(
    0,
    hist.totalInStock - hist.totalPurchased
  );
  hist.lastUpdateAt = new Date();
};

// ensure the current month history entry exists, return the doc reference
const ensureMonthEntry = (bev, year, month) => {
  let idx = findHistoryIndex(bev, year, month);
  if (idx === -1) {
    const opening = getPrevClosing(bev, year, month) || 0;
    bev.history.push({
      year,
      month,
      openingStock: opening,
      totalRestocked: 0,
      totalRemoved: 0,
      totalPurchased: 0,
      totalInStock: opening,
      availableAfterPurchases: opening,
      restockEvents: [],
      removalEvents: [],
      purchaseEvents: [],
      lastUpdateAt: new Date(),
    });
    idx = bev.history.length - 1;
  }
  return bev.history[idx];
};

export const createBeverage = async (req, res) => {
  try {
    const {
      beverageName,
      price,
      category,
      runningStock, // frontend sends this as new stock quantity
      note,
      isVisible = true,
    } = req.body;

    if (!beverageName || !price || !category || runningStock === undefined) {
      return res.status(400).json({
        success: false,
        message: "beverageName, price, category, and runningStock are required.",
      });
    }

    const now = dayjs();
    const year = now.year();
    const month = now.month() + 1; // month() returns 0–11, so +1

    // history entry — oldStock always 0 for creation
    const historyQuantity = [
      {
        year,
        month,
        lastUpdateAt: now.toDate(),
        oldStock: 0,
        purchasedStock: 0,
        isPurchased: false,
        newStock: runningStock, // frontend sent value
        date: now.toDate(),
        note: note || "",
      },
    ];

    const newBeverage = new Beverage({
      beverageName,
      price,
      category,
      runningStock,
      isVisible,
      status: "active",
      lastUpdateAt: now.toDate(),
      historyQuantity,
    });

    const savedBeverage = await newBeverage.save();

    res.status(201).json({
      success: true,
      message: "Beverage created successfully.",
      data: savedBeverage,
    });
  } catch (error) {
    console.error("Error creating beverage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create beverage.",
      error: error.message,
    });
  }
};

export const updateBeverage = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, runningStock, note } = req.body;

    if (!runningStock || runningStock <= 0) {
      return res.status(400).json({
        success: false,
        message: "runningStock must be greater than 0.",
      });
    }

    // Find existing beverage
    const beverage = await Beverage.findById(id);
    if (!beverage || beverage.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Beverage not found or has been deleted.",
      });
    }

    const now = dayjs();
    const year = now.year();
    const month = now.month() + 1;

    // Prepare new history entry
    const newHistory = {
      year,
      month,
      lastUpdateAt: now.toDate(),
      oldStock: beverage.runningStock || 0, // before update
      purchasedStock: 0,
      isPurchased: false,
      newStock: runningStock, // new stock value
      date: now.toDate(),
      note: note || "",
    };

    // Update beverage fields
    beverage.price = price !== undefined ? price : beverage.price;
    beverage.runningStock = runningStock;
    beverage.lastUpdateAt = now.toDate();

    // Append to historyQuantity
    beverage.historyQuantity.push(newHistory);

    // Save
    const updatedBeverage = await beverage.save();

    res.status(200).json({
      success: true,
      message: "Beverage updated successfully.",
      data: updatedBeverage,
    });
  } catch (error) {
    console.error("Error updating beverage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update beverage.",
      error: error.message,
    });
  }
};


// Code Explanation for understand

// UPDATE MODE:
//  - action = "edit"     : update name/price/category/isVisible only (no history changes)
//  - action = "restock"  : add stock (+quantity)
//  - action = "remove"   : remove stock non-sale (-quantity)
//  - action = "purchase" : record purchase (-quantity)

// Body examples:
//  { action: "restock", quantity: 10, note: "supplier abc" }
//  { action: "remove", quantity: 2, note: "damaged" }
//  { action: "purchase", quantity: 5, note: "order #123" }
//  { action: "edit", beverageName, price, category, isVisible }

// export const updateBeverage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       action = "edit",
//       quantity,
//       note,
//       beverageName,
//       price,
//       category,
//       isVisible,
//     } = req.body;
//
//     const bev = await Beverage.findById(id);
//     if (!bev || bev.status === "deleted") {
//       return res
//         .status(404)
//         .json({ success: false, message: "Beverage not found" });
//     }
//
//     const q = Number(quantity) || 0;
//     const now = new Date();
//     const { year, month } = yyyymmFromDate(now);
//
//     if (action === "edit") {
//       if (beverageName !== undefined) bev.beverageName = beverageName;
//       if (price !== undefined) bev.price = price;
//       if (category !== undefined) bev.category = category;
//       if (isVisible !== undefined) bev.isVisible = isVisible;
//       bev.lastUpdateAt = now;
//       await bev.save();
//       return res.json({ success: true, data: bev });
//     }
//
//     const hist = ensureMonthEntry(bev, year, month);
//
//     if (action === "restock") {
//       if (q <= 0) {
//         return res
//           .status(400)
//           .json({ success: false, message: "quantity must be > 0" });
//       }
//       bev.runningStock += q;
//       hist.restockEvents.push({ quantity: q, date: now, note });
//     } else if (action === "remove") {
//       if (q <= 0) {
//         return res
//           .status(400)
//           .json({ success: false, message: "quantity must be > 0" });
//       }
//       if (bev.runningStock - q < 0) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Insufficient stock to remove" });
//       }
//       bev.runningStock -= q;
//       hist.removalEvents.push({ quantity: q, date: now, note });
//     } else if (action === "purchase") {
//       if (q <= 0) {
//         return res
//           .status(400)
//           .json({ success: false, message: "quantity must be > 0" });
//       }
//       if (bev.runningStock - q < 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient stock to record purchase",
//         });
//       }
//       bev.runningStock -= q;
//       hist.purchaseEvents.push({ quantity: q, date: now, note });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid action. Use edit|restock|remove|purchase",
//       });
//     }
//
//     recomputeMonthlyTotals(bev, hist);
//     if (samePeriod({ year, month }, yyyymmFromDate(now))) {
//       bev.currentMonthStock = hist.totalInStock;
//       bev.currentMonthAvailable = hist.availableAfterPurchases;
//     }
//     bev.lastUpdateAt = now;
//
//     await bev.save();
//     return res.json({ success: true, data: bev });
//   } catch (err) {
//     console.error(err);
//     return res.status(400).json({ success: false, message: err.message });
//   }
// };

// Soft delete
export const deleteBeverage = async (req, res) => {
  try {
    const { id } = req.params;
    const bev = await Beverage.findById(id);
    if (!bev || bev.status === "deleted") {
      return res
        .status(404)
        .json({ success: false, message: "Beverage not found" });
    }
    bev.status = "deleted";
    bev.isVisible = false;
    bev.deletedAt = new Date();
    await bev.save();
    return res.json({ success: true, message: "Soft deleted" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Get all

// Query:
        //  - includeDeleted=true|false (default false)
        //  - category=Hard Liquor | Soft Drinks
        //  - year=YYYY&month=MM to attach current-month snapshot in `meta.month`
        //  - date=YYYY-MM-DD to filter day-specific restock details in `meta.day`

export const getAllBeverages = async (req, res) => {
  try {
    const {
      includeDeleted = "false",
      category,
      year,
      month,
      date, // optional day filter
      //restaurantType
    } = req.query;

    //const { userId } = req.user;

    //const defaultRestaurantType = await getRestaurantTypeByUserRole(userId);

    //const resolvedRestaurantType = restaurantType || defaultRestaurantType;

    const filter = {
      //...(restaurantType ? { resolvedRestaurantType } : {}),
      ...(includeDeleted !== "true" ? { status: "active" } : {}),
      ...(category ? { category } : {}),
    };

    // if year + month provided, fetch only relevant histories
    let beverages;
    if (year && month) {
      beverages = await Beverage.find({
        ...filter,
        history: {
          $elemMatch: {
            year: Number(year),
            month: Number(month),
          },
        },
      }).lean();
    } else {
      beverages = await Beverage.find(filter).lean();
    }

    // 🚨 check for not found
    if (!beverages || beverages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No beverages found for the given criteria",
      });
    }

    // post-processing: attach the meta info
    if (year && month) {
      const y = Number(year);
      const m = Number(month);

      const dateObj = date ? new Date(date) : null;
      const dayStart = dateObj
          ? new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
          : null;
      const dayEnd = dateObj
          ? new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1)
          : null;

      for (const it of beverages) {
        const hist = (it.history || []).find((h) => h.year === y && h.month === m);
        if (hist) {
          it.meta = {
            month: {
              year: y,
              month: m,
              openingStock: hist.openingStock,
              totalRestocked: hist.totalRestocked,
              totalRemoved: hist.totalRemoved,
              totalPurchased: hist.totalPurchased,
              totalInStock: hist.totalInStock,
              availableAfterPurchases: hist.availableAfterPurchases,
              lastUpdateAt: hist.lastUpdateAt,
            },
          };

          // If a specific day is requested
          if (dayStart && dayEnd) {
            const inRange = (d) => {
              const x = new Date(d);
              return x >= dayStart && x < dayEnd;
            };
            it.meta.day = {
              date,
              restocked: (hist.restockEvents || [])
                  .filter((e) => inRange(e.date))
                  .reduce((s, e) => s + e.quantity, 0),
              removed: (hist.removalEvents || [])
                  .filter((e) => inRange(e.date))
                  .reduce((s, e) => s + e.quantity, 0),
              purchased: (hist.purchaseEvents || [])
                  .filter((e) => inRange(e.date))
                  .reduce((s, e) => s + e.quantity, 0),
            };
          }
        }
      }
    }

    return res.json({ success: true, data: beverages });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: err.message });
  }
};


// export const getAllBeverages = async (req, res) => {
//   try {
//     const {
//       includeDeleted = "false",
//       category,
//       year,
//       month,
//       date, // optional day filter
//     } = req.query;
//
//     const filter = {
//       ...(includeDeleted !== "true" ? { status: "active" } : {}),
//       ...(category ? { category } : {}),
//     };
//
//     const list = await Beverage.find(filter).lean();
//
//     if (year || month || date) {
//       const y = Number(year) || new Date().getFullYear();
//       const m = Number(month) || new Date().getMonth() + 1;
//
//       const dateObj = date ? new Date(date) : null;
//       const dayStart = dateObj
//         ? new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
//         : null;
//       const dayEnd = dateObj
//         ? new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1)
//         : null;
//
//       for (const it of list) {
//         const hist = (it.history || []).find((h) => h.year === y && h.month === m);
//         if (hist) {
//           it.meta = {
//             month: {
//               year: y,
//               month: m,
//               openingStock: hist.openingStock,
//               totalRestocked: hist.totalRestocked,
//               totalRemoved: hist.totalRemoved,
//               totalPurchased: hist.totalPurchased,
//               totalInStock: hist.totalInStock,
//               availableAfterPurchases: hist.availableAfterPurchases,
//               lastUpdateAt: hist.lastUpdateAt,
//             },
//           };
//
//           if (dayStart && dayEnd) {
//             const inRange = (d) => {
//               const x = new Date(d);
//               return x >= dayStart && x < dayEnd;
//             };
//             it.meta.day = {
//               date,
//               restocked: (hist.restockEvents || [])
//                 .filter((e) => inRange(e.date))
//                 .reduce((s, e) => s + e.quantity, 0),
//               removed: (hist.removalEvents || [])
//                 .filter((e) => inRange(e.date))
//                 .reduce((s, e) => s + e.quantity, 0),
//               purchased: (hist.purchaseEvents || [])
//                 .filter((e) => inRange(e.date))
//                 .reduce((s, e) => s + e.quantity, 0),
//             };
//           }
//         }
//       }
//     }
//
//     return res.json({ success: true, data: list });
//   } catch (err) {
//     console.error(err);
//     return res.status(400).json({ success: false, message: err.message });
//   }
// };

// READ: get one

export const getOneBeverage = async (req, res) => {
  try {
    const { id } = req.params;
    const bev = await Beverage.findById(id);
    if (!bev || bev.status === "deleted") {
      return res
        .status(404)
        .json({ success: false, message: "Beverage not found" });
    }
    return res.json({ success: true, data: bev });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// category summary
            // GET /api/beverages/categories/summary?year=YYYY&month=MM
            // Optional: &date=YYYY-MM-DD for day-only restock/remove/purchase

export const getCategorySummary = async (req, res) => {
  try {
    const y = Number(req.query.year) || new Date().getFullYear();
    const m = Number(req.query.month) || new Date().getMonth() + 1;
    const date = req.query.date ? new Date(req.query.date) : null;

    // load active only
    const list = await Beverage.find({ status: "active" }).lean();

    const perCat = {};
    for (const it of list) {
      const cat = it.category || "Uncategorized";
      if (!perCat[cat]) {
        perCat[cat] = {
          category: cat,
          totalRunningStock: 0,
          totalMonthRestocked: 0,
          totalMonthRemoved: 0,
          totalMonthPurchased: 0,
          totalMonthInStock: 0,
          totalMonthAvailable: 0,
          // daily if date provided
          dayRestocked: 0,
          dayRemoved: 0,
          dayPurchased: 0,
        };
      }

      perCat[cat].totalRunningStock += it.runningStock || 0;

      const hist = (it.history || []).find((h) => h.year === y && h.month === m);
      if (hist) {
        perCat[cat].totalMonthRestocked += hist.totalRestocked || 0;
        perCat[cat].totalMonthRemoved += hist.totalRemoved || 0;
        perCat[cat].totalMonthPurchased += hist.totalPurchased || 0;
        perCat[cat].totalMonthInStock += hist.totalInStock || 0;
        perCat[cat].totalMonthAvailable += hist.availableAfterPurchases || 0;

        if (date) {
          const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
          const inRange = (d) => {
            const x = new Date(d);
            return x >= start && x < end;
          };
          perCat[cat].dayRestocked += (hist.restockEvents || [])
            .filter((e) => inRange(e.date))
            .reduce((s, e) => s + e.quantity, 0);
          perCat[cat].dayRemoved += (hist.removalEvents || [])
            .filter((e) => inRange(e.date))
            .reduce((s, e) => s + e.quantity, 0);
          perCat[cat].dayPurchased += (hist.purchaseEvents || [])
            .filter((e) => inRange(e.date))
            .reduce((s, e) => s + e.quantity, 0);
        }
      }
    }

    return res.json({
      success: true,
      data: Object.values(perCat),
      period: { year: y, month: m, date: req.query.date || null },
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: err.message });
  }
};
