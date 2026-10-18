import PBFoodNetCategory from "../../models/PoolAndBeachResturant/PBFoodNetCategory.js";
import { getRestaurantType } from "../../utils/user-util.js";

export const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    // check if category already exists
    // const existing = await PBFoodNetCategory.findOne({
    //   categoryName: new RegExp(`^${categoryName}$`, "i"),
    // });
    //
    // if (existing) {
    //   return res.status(400).json({ error: "Category already exists" });
    // }

    // create new category in the hotel's single restaurant
    const category = await PBFoodNetCategory.create({
      categoryName,
      restaurantType: getRestaurantType(),
    });

    return res.status(201).json(category);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
    try {
        const update = { ...req.body };
        delete update.restaurantType; // there is only one restaurant
        const category = await PBFoodNetCategory.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );
        res.json(category);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const category = await PBFoodNetCategory.findByIdAndUpdate(
            req.params.id,
            { isVisible: false },
            { new: true }
        );
        res.json({ message: "Category soft deleted", category });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getCategories = async (req, res) => {
    const categories = await PBFoodNetCategory.find({});
    res.json(categories);
};

export const getAvailableCategories = async (req, res) => {
    const categories = await PBFoodNetCategory.find({ isVisible: true });
    res.json(categories);
};

export const getCategory = async (req, res) => {
    const category = await PBFoodNetCategory.findById(req.params.id);
    res.json(category);
};