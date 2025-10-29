import PBFoodNetCategory from "../../models/PoolAndBeachResturant/PBFoodNetCategory.js";
import { getRestaurantTypeByUserRole } from "../../utils/user-util.js";

export const createCategory = async (req, res) => {
  try {
    const { categoryName, restaurantType } = req.body;
    const { userId } = req.user;

    // get default type based on user role
    const defaultRestaurantType = await getRestaurantTypeByUserRole(userId);

    // check if category already exists for this restaurant type
    const existing = await PBFoodNetCategory.findOne({
      categoryName: new RegExp(`^${categoryName}$`, "i"),
      restaurantType: restaurantType || defaultRestaurantType,
    });

    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    // create new category
    const category = await PBFoodNetCategory.create({
      categoryName,
      restaurantType: restaurantType || defaultRestaurantType,
    });

    return res.status(201).json(category);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
    try {
        const category = await PBFoodNetCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
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
    const { userId } = req.user;

    const defaultRestaurantType = await getRestaurantTypeByUserRole(userId);

    const restaurantType =  req.query.restaurantType || defaultRestaurantType;
    const filter = {
      ...(restaurantType ? { restaurantType } : {}),
    };

    const categories = await PBFoodNetCategory.find(filter);
    res.json(categories);
};

export const getAvailableCategories = async (req, res) => {
    const { userId } = req.user;

    const defaultRestaurantType = await getRestaurantTypeByUserRole(userId);

    const restaurantType =  req.query.restaurantType || defaultRestaurantType;

    const filter = {
      isVisible: true,
      ...(restaurantType ? { restaurantType } : {}),
    };

    const categories = await PBFoodNetCategory.find(filter );
    res.json(categories);
};

export const getCategory = async (req, res) => {
    const category = await PBFoodNetCategory.findById(req.params.id);
    res.json(category);
};