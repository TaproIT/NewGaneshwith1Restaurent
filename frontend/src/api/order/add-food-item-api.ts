import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { FoodItem } from "@/component/beach-&-pool-restaurant/food-model";

interface AddFoodItem {
  itemName: string;
  price: number;
  restaurantType: string;
  isVisible: boolean;
  category: string | null;
  isEnableBeverage: boolean;
  liquor: {id:string, amount:number}[];
}
/**
 * Async thunk to add a table into specific order
 */
export const addNewFoodItem = createAsyncThunk<
  FoodItem,
  AddFoodItem
>("food/addNewFoodItem", async (addFoodItem:AddFoodItem, { rejectWithValue }) => {
  try {
    const response = await api.post(`/pbfoodnets`,addFoodItem);
    return response.data.data as FoodItem;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data.message || "Failed to add food item");
  }
});
