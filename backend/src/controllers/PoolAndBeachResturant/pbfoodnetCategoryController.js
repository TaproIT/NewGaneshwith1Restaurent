// import PBFoodNetCategory from "../../models/PoolAndBeachResturant/PBFoodNetCategory.js";

// export const createCategory = async (req, res) => {
//     try {
//         const { categoryName } = req.body;

//         const existing = await PBFoodNetCategory.findOne({ categoryName: new RegExp(`^${categoryName}$`, "i") });

//         if (existing) {
//             return res.status(400).json({ error: "Category already exists" });
//         }

//         const category = await PBFoodNetCategory.create({ categoryName });
//         res.status(201).json(category);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateCategory = async (req, res) => {
//     try {
//         const category = await PBFoodNetCategory.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//         );
//         res.json(category);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };

// export const deleteCategory = async (req, res) => {
//     try {
//         const category = await PBFoodNetCategory.findByIdAndUpdate(
//             req.params.id,
//             { isVisible: false },
//             { new: true }
//         );
//         res.json({ message: "Category soft deleted", category });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };

// export const getCategories = async (req, res) => {
//     const categories = await PBFoodNetCategory.find();
//     res.json(categories);
// };

// export const getAvailableCategories = async (req, res) => {
//     const categories = await PBFoodNetCategory.find({ isVisible: true });
//     res.json(categories);
// };

// export const getCategory = async (req, res) => {
//     const category = await PBFoodNetCategory.findById(req.params.id);
//     res.json(category);
// };




import PBFoodNet from "../../models/PoolAndBeachResturant/PBFoodNet.js";
import PBFoodNetCategory from "../../models/PoolAndBeachResturant/PBFoodNetCategory.js";
import Beverage from "../../models/Beverage/./beverage.js";

export const createPBFoodNet = async (req, res) => {
    try {
        const category = await PBFoodNetCategory.findOne({
            _id: req.body.category,
            isVisible: true
        });

        if (!category) {
            return res.status(400).json({ error: "Category not found or not visible." });
        }

        if (req.body.liquor && req.body.liquor.length > 0) {
            const liquorIds = req.body.liquor;

            const uniqueIds = new Set(liquorIds.map(id => id.toString()));
            if (uniqueIds.size !== liquorIds.length) {
                return res.status(400).json({ error: "Duplicate liquor IDs are not allowed." });
            }

            const beverages = await Beverage.find({
                _id: { $in: liquorIds },
                isVisible: true,
                category: "Hard Liquor"
            });

            if (beverages.length !== liquorIds.length) {
                return res.status(400).json({ error: "One or more liquors not found, not visible, or not Hard Liquor." });
            }
        }

        const item = await PBFoodNet.create(req.body);
        return res.status(201).json(item);

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
export const updatePBFoodNet = async (req, res) => {
    try {
        const updateData = {};

        if (req.body.itemName && req.body.itemName.trim() !== "") {
            updateData.itemName = req.body.itemName;
        }
        if (req.body.price !== null && req.body.price !== undefined) {
            updateData.price = req.body.price;
        }
        if (req.body.restaurantType && req.body.restaurantType.trim() !== "") {
            updateData.restaurantType = req.body.restaurantType;
        }
        if (req.body.isVisible !== null && req.body.isVisible !== undefined) {
            updateData.isVisible = req.body.isVisible;
        }
        if (req.body.category !== null && req.body.category !== undefined) {
            const category = await PBFoodNetCategory.findOne({
                _id: req.body.category,
                isVisible: true
            });
            if (!category) {
                return res.status(400).json({ error: "Category not found or not visible." });
            }
            updateData.category = req.body.category;
        }
        if (req.body.isEnableBeverage !== null && req.body.isEnableBeverage !== undefined) {
            updateData.isEnableBeverage = req.body.isEnableBeverage;
        }

        if (req.body.liquor !== null && req.body.liquor !== undefined) {
            const liquorIds = req.body.liquor.map(id => id.toString());

            const uniqueIds = new Set(liquorIds);
            if (uniqueIds.size !== liquorIds.length) {
                return res.status(400).json({ error: "Duplicate liquor IDs are not allowed." });
            }

            const beverages = await Beverage.find({
                _id: { $in: liquorIds },
                isVisible: true,
                category: "Hard Liquor"
            });

            if (beverages.length !== liquorIds.length) {
                return res.status(400).json({ error: "One or more liquors not found, not visible, or not Hard Liquor." });
            }

            updateData.liquor = liquorIds;
        }

        const updatedItem = await PBFoodNet.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: false }
        ).populate("category liquor");

        if (!updatedItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        return res.json(updatedItem);

    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

export const deletePBFoodNet = async (req, res) => {
    try {
        const item = await PBFoodNet.findByIdAndUpdate(
            req.params.id,
            { isVisible: false },
            { new: true }
        );
        res.json({ message: "PBFoodNet item soft deleted", item });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
export const getPBFoodNets = async (req, res) => {
    const items = await PBFoodNet.find()
        .populate("category")
        .populate("beverages");
    res.json(items);
};

export const getPBFoodNet = async (req, res) => {
    const item = await PBFoodNet.findById(req.params.id)
        .populate("category")   
        .populate("beverages");
    res.json(item);
};

export const getAvailablePBFoodNets = async (req, res) => {
    try{
        const items = await PBFoodNet.find({ isVisible: true })
            .populate("category")
            .populate("beverages");

        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No available items found" });
        }
        res.json(items);
    }catch(err){
        res.statusCode(400).json({ error: err.message });
    }
};

export const getAvailablePBFoodNet = async (req, res) => {
    try {
        const items = await PBFoodNet.findOne({_id: req.params.id, isVisible: true })
            .populate("category")
            .populate("beverages");

        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No available items found" });
        }

        res.json(items);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
};