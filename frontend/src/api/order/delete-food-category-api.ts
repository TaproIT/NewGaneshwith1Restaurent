import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { FoodCategory } from "@/component/beach-&-pool-restaurant/food-category";
import { fetchAllFoodCategories } from "./get-food-categories-api";


interface DeleteFoodCategoryRequest {
  categoryId: string | null;
}



export const deleteFoodCategory = createAsyncThunk<
  FoodCategory,
  DeleteFoodCategoryRequest
>("foodCategory/deleteFoodCategory",  async (foodCategoryData, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.delete(`/pbfoodcategories/${foodCategoryData.categoryId}`);
    await dispatch(fetchAllFoodCategories());
    return response.data.data as FoodCategory;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to update food category");
  }
});
