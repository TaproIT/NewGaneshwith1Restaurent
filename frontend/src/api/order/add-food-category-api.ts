import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { FoodCategory } from "@/component/beach-&-pool-restaurant/food-category";
import { fetchAllFoodCategories } from "./get-food-categories-api";

interface AddFoodCategory {
  categoryName: string;
}

/**
 * Async thunk to add a new food category
 */
export const addNewFoodCategory = createAsyncThunk<
  FoodCategory,
  AddFoodCategory
>(
  "foodCategory/addNewFoodCategory",
  async (foodCategory: AddFoodCategory, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/pbfoodcategories`, foodCategory);
      await dispatch(fetchAllFoodCategories());
      return response.data.data as FoodCategory;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to add food category"
      );
    }
  }
);
