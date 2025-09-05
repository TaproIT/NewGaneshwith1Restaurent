import PBFoodNet from "../../models/PoolAndBeachResturant/PBFoodNet.js";
import PBFoodNetCategory from "../../models/PoolAndBeachResturant/PBFoodNetCategory.js";
import Beverage from "../../models/Beverage/./beverage.js";

export const createPBFoodNet = async (req, res) => {
    try {
        // 1. check if category exists and visible
        const category = await PBFoodNetCategory.findOne({
            _id: req.body.category,
            isVisible: true
        });

        if (!category) {
            return res.status(400).json({ error: "Category not found or not visible." });
        }

        const food = PBFoodNet.findOne({
            itemName: req.body.itemName,
            category: req.body.category,
        })

        if (food) {
            return res.status(400).json({ error: "Food already exists in this category" });
        }


        if (req.body.liquor && req.body.liquor.length > 0) {
            const liquorIds = req.body.liquor;

            const uniqueIds = new Set(liquorIds.map(id => id.toString()));
            if (uniqueIds.size !== liquorIds.length) {
                return res.status(400).json({error: "Duplicate liquor IDs are not allowed."});
            }

            // 2. check beverages if provided
            if (req.body.liquor && req.body.liquor.length > 0) {
                const beverages = await Beverage.find({
                    _id: {$in: req.body.liquor},
                    isVisible: true,
                    category: "hard liquor"
                });

                if (beverages.length !== liquorIds.length) {
                    return res.status(400).json({error: "One or more liquors not found, not visible, or not hard liquor."});
                }
            }
        }

        // 3. create PBFoodNet item
        const item = await PBFoodNet.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

export const updatePBFoodNet = async (req, res) => {
    try {
        const updateData = {};

        // Only add keys that exist in the body (skip null/undefined/"")
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
                category: "hard liquor"
            });

            if (beverages.length !== liquorIds.length) {
                return res.status(400).json({ error: "One or more liquors not found, not visible, or not Hard Liquor." });
            }

            updateData.liquor = liquorIds;
        }

        //  Partial update without triggering required field validation
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
        return res.json({ message: "PBFoodNet item soft deleted", item });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
export const getPBFoodNets = async (req, res) => {
    const items = await PBFoodNet.find()
        .populate("category")
        .populate("liquor");
    return res.json(items);
};

export const getPBFoodNet = async (req, res) => {
    const item = await PBFoodNet.findById(req.params.id)
        .populate("category")   
        .populate("liquor");
    return res.json(item);
};

export const getAvailablePBFoodNets = async (req, res) => {
    try{
        const items = await PBFoodNet.find({ isVisible: true })
            .populate("category")
            .populate("liquor");

        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No available items found" });
        }
        return res.json(items);
    }catch(err){
        return res.statusCode(400).json({ error: err.message });
    }


};

export const getAvailablePBFoodNet = async (req, res) => {
    try {
        const items = await PBFoodNet.findOne({_id: req.params.id, isVisible: true })
            .populate("category")
            .populate("liquor");

        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No available items found" });
        }

        return res.json(items);
    } catch (err) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

