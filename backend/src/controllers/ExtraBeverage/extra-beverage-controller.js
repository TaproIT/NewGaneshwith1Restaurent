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
// Soft Delete Extra Beverage Category
export const deleteExtraBeverageCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Find category by ID
        const category = await ExtraBeverageCategory.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, error: "Category not found" });
        }

        // If already soft deleted
        if (!category.isVisible) {
            return res.status(400).json({ success: false, error: "Category already deleted" });
        }

        // Mark as invisible (soft delete)
        category.isVisible = false;
        await category.save();

        res.json({ success: true, message: "Category soft deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

export const getAvailableExtraBeverageCategories = async (req, res) => {
    try {
        const {
            search,     // optional search by name
            sortBy,     // optional sort field (e.g. name, createdAt)
            sortOrder,  // optional sort direction: asc or desc
        } = req.query;

        // Only visible categories (not soft-deleted)
        const filter = { isVisible: true };

        if (search) {
            filter.name = { $regex: search, $options: "i" }; // case-insensitive search
        }

        // Sorting logic
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        } else {
            sort.createdAt = -1; // newest first
        }

        // Fetch visible categories
        const categories = await ExtraBeverageCategory.find(filter)
            .sort(sort)
            .lean();

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
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
            isVisible: true,
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


// Soft Delete Extra Beverage
export const deleteExtraBeverage = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the beverage by ID
        const beverage = await ExtraBeverage.findById(id);

        if (!beverage) {
            return res.status(404).json({ success: false, error: "Beverage not found" });
        }

        // If already hidden (soft deleted)
        if (!beverage.isVisible) {
            return res.status(400).json({ success: false, error: "Beverage already deleted" });
        }

        // Soft delete by marking as invisible
        beverage.isVisible = false;
        await beverage.save();

        res.json({ success: true, message: "Beverage soft deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

export const getAvailableExtraBeverages = async (req, res) => {
    try {
        const {
            category,   // optional filter by category
            search,     // optional search by name
            sortBy,     // optional sort field (e.g., price, beverageName)
            sortOrder,  // optional sort direction: 'asc' or 'desc'
        } = req.query;

        // Base filter: only visible and enabled beverages
        const filter = { isVisible: true };

        if (category) {
            filter.extraBeverageCategory = category;
        }

        if (search) {
            filter.beverageName = { $regex: search, $options: "i" }; // case-insensitive search
        }

        // Build sort object
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        } else {
            sort.createdAt = -1; // default: newest first
        }

        // Fetch beverages
        const beverages = await ExtraBeverage.find(filter)
            .populate("extraBeverageCategory", "name") // optional populate
            .populate("liquor.beverage", "beverageName price") // optional populate for liquor
            .sort(sort)
            .lean();

        res.status(200).json({
            success: true,
            count: beverages.length,
            data: beverages,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
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
