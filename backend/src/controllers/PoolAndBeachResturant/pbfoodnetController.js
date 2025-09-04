import PBFoodNet from "../../models/PoolAndBeachResturant/PBFoodNet.js";
import PBFoodNetCategory from "../../models/PoolAndBeachResturant/PBFoodNetCategory.js";
import Beverage from "../../models/Beverage/Beverage.js";

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

        // 2. check beverages if provided
        if (req.body.beverages && req.body.beverages.length > 0) {
            const beverages = await Beverage.find({
                _id: { $in: req.body.beverages },
                isVisible: true
            });

            if (beverages.length !== req.body.beverages.length) {
                return res.status(400).json({ error: "One or more beverages not found or not visible." });
            }
        }

        // 3. create PBFoodNet item
        const item = await PBFoodNet.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
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
            updateData.category = req.body.category;
        }
        if (req.body.isEnableBeverage !== null && req.body.isEnableBeverage !== undefined) {
            updateData.isEnableBeverage = req.body.isEnableBeverage;
        }
        if (req.body.beverages !== null && req.body.beverages !== undefined) {
            updateData.beverages = req.body.beverages;
        }

        // ✅ Partial update without triggering required field validation
        const updatedItem = await PBFoodNet.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: false } // skip full schema validation
        ).populate("category beverages");

        if (!updatedItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
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

