import type { FoodItem } from "@/component/beach-&-pool-restaurant/food-model";
import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAllFoodItems } from "./get-food-list-api";


interface DeleteFoodItemRequest {
  foodId: string;
}



export const deleteFoodItem = createAsyncThunk<
  FoodItem,
  DeleteFoodItemRequest
>("food/deleteFoodItem",  async (foodItemData, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.delete(`/pbfoodnets/${foodItemData.foodId}`);
    await dispatch(fetchAllFoodItems());
    return response.data.data.foodItem as FoodItem;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to delete food item");
  }
});
