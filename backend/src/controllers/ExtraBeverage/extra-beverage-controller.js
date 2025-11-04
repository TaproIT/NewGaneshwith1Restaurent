import ExtraBeverage from "../../models/ExtraBeverages/extra-beverage-model.js";
import ExtraBeverageCategory from "../../models/ExtraBeverages/extraBeverageCategory.js";

// Category

// Create Category


export const createExtraBeverageCategory = async (req, res) => {
    try {
        const { name, isVisible } = req.body;
        const category = await ExtraBeverageCategory.create({ name, isVisible });
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get all Categories
export const listExtraBeverageCategories = async (req, res) => {
    try {
        const { q } = req.query;
        const filter = q ? { name: { $regex: q, $options: "i" } } : {};
        const categories = await ExtraBeverageCategory.find(filter)
            .sort({ name: 1 })
            .lean();
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get one
export const getExtraBeverageCategory = async (req, res) => {
    try {
        const category = await ExtraBeverageCategory.findById(req.params.id).lean();
        if (!category)
            return res.status(404).json({ success: false, error: "Category not found" });
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Update
export const updateExtraBeverageCategory = async (req, res) => {
    try {
        const { name, isVisible } = req.body;
        const updated = await ExtraBeverageCategory.findByIdAndUpdate(
            req.params.id,
            { ...(name && { name }), ...(isVisible !== undefined && { isVisible }) },
            { new: true, runValidators: true }
        ).lean();
        if (!updated)
            return res.status(404).json({ success: false, error: "Category not found" });
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Delete
export const deleteExtraBeverageCategory = async (req, res) => {
    try {
        const deleted = await ExtraBeverageCategory.findByIdAndDelete(req.params.id).lean();
        if (!deleted)
            return res.status(404).json({ success: false, error: "Category not found" });
        res.json({ success: true, message: "Category deleted" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Toggle Visibility
export const toggleExtraBeverageCategoryVisibility = async (req, res) => {
    try {
        const category = await ExtraBeverageCategory.findById(req.params.id);
        if (!category)
            return res.status(404).json({ success: false, error: "Category not found" });
        category.isVisible = !category.isVisible;
        await category.save();
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};



//  Beverage

// Create Beverage
export const createExtraBeverage = async (req, res) => {
    try {
        const { beverageName, extraBeverageCategory, price, isVisible, isEnableBeverage, liquor } = req.body;

        const exists = await ExtraBeverageCategory.exists({ _id: extraBeverageCategory });
        if (!exists) return res.status(400).json({ error: "Invalid category" });

        if (liquor && !Array.isArray(liquor))
            return res.status(400).json({ error: "Liquor must be an array" });

        const beverage = await ExtraBeverage.create({
            beverageName,
            extraBeverageCategory,
            price,
            isVisible,
            isEnableBeverage,
            liquor: liquor || [],
        });

        const populated = await beverage.populate([
            { path: "extraBeverageCategory", select: "name" },
            { path: "liquor.beverage", select: "name" }, // assuming Beverage has a `name` field
        ]);

        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


// List Beverages
export const listExtraBeverages = async (req, res) => {
    try {
        const { q, categoryId, visible } = req.query;
        const filter = {};
        if (q) filter.beverageName = { $regex: q, $options: "i" };
        if (categoryId) filter.extraBeverageCategory = categoryId;
        if (visible !== undefined) filter.isVisible = visible === "true";

        const beverages = await ExtraBeverage.find(filter)
            .populate("extraBeverageCategory", "name")
            .sort({ beverageName: 1 })
            .lean();

        res.json({ success: true, data: beverages });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get one
export const getExtraBeverage = async (req, res) => {
    try {
        const beverage = await ExtraBeverage.findById(req.params.id)
            .populate("extraBeverageCategory", "name")
            .lean();
        if (!beverage)
            return res.status(404).json({ success: false, error: "Beverage not found" });
        res.json({ success: true, data: beverage });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

export const updateExtraBeverage = async (req, res) => {
    try {
        const { beverageName, extraBeverageCategory, price, isEnableBeverage, isVisible, liquor } = req.body;

        if (extraBeverageCategory) {
            const exists = await ExtraBeverageCategory.exists({ _id: extraBeverageCategory });
            if (!exists) return res.status(400).json({ error: "Invalid category" });
        }

        // Optional: liquor validation
        if (liquor && !Array.isArray(liquor))
            return res.status(400).json({ error: "Liquor must be an array" });

        const updateFields = {
            ...(beverageName && { beverageName }),
            ...(extraBeverageCategory && { extraBeverageCategory }),
            ...(price !== undefined && { price }),
            ...(isVisible !== undefined && { isVisible }),
            ...(isEnableBeverage !== undefined && { isEnableBeverage }),
            ...(liquor && { liquor }), 
        };

        const updated = await ExtraBeverage.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        )
            .populate([
                { path: "extraBeverageCategory", select: "name" },
                { path: "liquor.beverage", select: "name" },
            ])
            .lean();

        if (!updated)
            return res.status(404).json({ success: false, error: "Beverage not found" });

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


// Delete
export const deleteExtraBeverage = async (req, res) => {
    try {
        const deleted = await ExtraBeverage.findByIdAndDelete(req.params.id).lean();
        if (!deleted)
            return res.status(404).json({ success: false, error: "Beverage not found" });
        res.json({ success: true, message: "Beverage deleted" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Toggle Visibility
export const toggleExtraBeverageVisibility = async (req, res) => {
    try {
        const beverage = await ExtraBeverage.findById(req.params.id);
        if (!beverage)
            return res.status(404).json({ success: false, error: "Beverage not found" });
        beverage.isVisible = !beverage.isVisible;
        await beverage.save();
        const populated = await beverage.populate("extraBeverageCategory", "name");
        res.json({ success: true, data: populated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
