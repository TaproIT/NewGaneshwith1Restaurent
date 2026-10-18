import { DEFAULT_RESTAURANT_TYPE } from "./enums/order-related-enums.js";

// The hotel runs a single restaurant, so every order, table and menu item
// belongs to it whoever is logged in. Kept as one function so the rule
// lives in one place.
export const getRestaurantType = () => DEFAULT_RESTAURANT_TYPE;
