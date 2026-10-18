import PBFoodNet from "../../models/PoolAndBeachResturant/PBFoodNet.js";
import PBFoodNetCategory from "../../models/PoolAndBeachResturant/PBFoodNetCategory.js";
import Beverage from "../../models/Beverage/./beverage.js";
import { getRestaurantType } from "../../utils/user-util.js";

export const createPBFoodNet = async (req, res) => {
    try {
      const restaurantType = getRestaurantType();

      // 1. check if category exists and visible
      const category = await PBFoodNetCategory.findOne({
        _id: req.body.category,
        isVisible: true,
      });

      if (!category) {
        return res
          .status(400)
          .json({ error: "Category not found or not visible." });
      }

      // 2. check if food already exists in this category
      const food = await PBFoodNet.findOne({
        itemName: { $regex: new RegExp(`^${req.body.itemName}$`, "i") },
        category: req.body.category,
      });

      if (food) {
        return res
          .status(400)
          .json({ error: "Food already exists in this category" });
      }

      if (
        Array.isArray(req.body.liquor) &&
        req.body.liquor.length > 0 &&
        req.body.isEnableBeverage !== true
      ) {
        return res
          .status(400)
          .json({
            error: "isEnableBeverage must be true when liquor is provided.",
          });
      }

      // 3. validate liquors if provided
      if (req.body.liquor && req.body.liquor.length > 0) {
        // Extract beverage IDs from liquor array
        const liquorIds = req.body.liquor.map((l) => l.beverage);

        // Check duplicates
        const uniqueIds = new Set(liquorIds.map((id) => id.toString()));
        if (uniqueIds.size !== liquorIds.length) {
          return res
            .status(400)
            .json({ error: "Duplicate liquor IDs are not allowed." });
        }

        // Verify all beverages exist, visible, and category is "hard liquor"
        const beverages = await Beverage.find({
          _id: { $in: liquorIds },
          isVisible: true,
          category: "hard liquor",
          //restaurantType,
        });

        if (beverages.length !== liquorIds.length) {
          return res
            .status(400)
            .json({
              error:
                "One or more liquors not found, not visible, or not hard liquor.",
            });
        }
      }

      // 4. create PBFoodNet item
      const item = await PBFoodNet.create({...req.body, restaurantType});
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

        if (req.body.isVisible !== null && req.body.isVisible !== undefined) {
            updateData.isVisible = req.body.isVisible;
        }

        // Validate category if provided
        if (req.body.category !== null && req.body.category !== undefined) {
            const category = await PBFoodNetCategory.findOne({
                _id: req.body.category,
                isVisible: true,
            });
            if (!category) {
                return res.status(400).json({ error: "Category not found or not visible." });
            }
            updateData.category = req.body.category;
        }

        // isEnableBeverage flag
        if (req.body.isEnableBeverage !== null && req.body.isEnableBeverage !== undefined) {
            updateData.isEnableBeverage = req.body.isEnableBeverage;
        }

        // Liquor validation
        if (req.body.liquor !== null && req.body.liquor !== undefined) {
            if (!Array.isArray(req.body.liquor)) {
                return res.status(400).json({ error: "Liquor must be an array." });
            }

            // Extract only beverage IDs
            const liquorIds = req.body.liquor.map((l) =>
                typeof l.beverage === "object" ? l.beverage._id : l.beverage
            );

            // Check for duplicates
            const uniqueIds = new Set(liquorIds.map((id) => id.toString()));
            if (uniqueIds.size !== liquorIds.length) {
                return res.status(400).json({ error: "Duplicate liquor IDs are not allowed." });
            }

            // Validate beverages
            const beverages = await Beverage.find({
                _id: { $in: liquorIds },
                isVisible: true,
                category: "hard liquor",
            });

            if (beverages.length !== liquorIds.length) {
                return res.status(400).json({
                    error: "One or more liquors not found, not visible, or not Hard Liquor.",
                });
            }

            // Store full liquor objects (beverage + amount)
            updateData.liquor = req.body.liquor.map((l) => ({
                beverage: typeof l.beverage === "object" ? l.beverage._id : l.beverage,
                amount: l.amount !== undefined ? l.amount : 0,
            }));
        }

        // Partial update without triggering required field validation
        const updatedItem = await PBFoodNet.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: false }
        )
            .populate("category")
            .populate("liquor.beverage");

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
    const items = await PBFoodNet.find({})
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
            .populate("liquor.beverage", "beverageName price") ;

        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No available items found" });
        }
        return res.json(items);
    }catch(err){
        return res.status(400).json({ error: err.message });
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

