import type { FoodItem } from "@/component/beach-&-pool-restaurant/food-model";
import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAllFoodItems } from "./get-food-list-api";


interface UpdateFoodItemRequest {
  foodId: string;
  itemName: string;
  category: string;
  isEnableBeverage: boolean;
  liquor: {
    beverage: string;
    amount: number
  }[]
}



export const updateFoodItem = createAsyncThunk<
  FoodItem,
  UpdateFoodItemRequest
>("order/updateFoodItem",  async (foodItemData, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.patch(`/pbfoodnets/${foodItemData.foodId}`, foodItemData);
    await dispatch(fetchAllFoodItems());
    return response.data.data.foodItem as FoodItem;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to create order");
  }
});
