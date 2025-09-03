import type { FoodCategory } from "./food-category";

export interface FetchAllFoodItemsStatus {
     loading: boolean,
     error: string | null
}

export interface FoodItem {
  _id: string;
  itemName: string;
  price: number;
  restaurantType: string;
  isVisible: boolean;
  category: FoodCategory | null;
  isEnableBeverage: boolean;
  beverages: string[] | null; // array of Beverage ObjectIds
  fetchAllFoodItemsStatus: FetchAllFoodItemsStatus
}

export interface FoodItems {
  foodItems: FoodItem[];
  fetchAllFoodItemsStatus: FetchAllFoodItemsStatus
}