import User from "../models/user/user-model.js";
import { RestaurantTypes } from "./enums/order-related-enums.js";
import { userRoles } from "./enums/user-role.js";

export const getRestaurantTypeByUserRole = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    const user = await User.findById(id).lean();

    if (user.userRole === userRoles.BEACH_RESTAURANT_STAFF.value) {
      return RestaurantTypes.BEACH.value;
    }

    return RestaurantTypes.POOL.value;
  } catch (error) {
    console.error("Error in getRestaurantTypeByUserRole:", error.message);
    return null; // return null explicitly on error
  }
};
