import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { FoodCategory } from "@/component/beach-&-pool-restaurant/food-category";
import { fetchAllFoodCategories } from "./get-food-categories-api";


interface UpdateFoodCategoryRequest {
  categoryId: string | null;
  categoryName: string;
}



export const updateFoodCategory = createAsyncThunk<
  FoodCategory,
  UpdateFoodCategoryRequest
>("foodCategory/updateFoodCategory",  async (foodCategoryData, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.put(`/pbfoodcategories/${foodCategoryData.categoryId}`, foodCategoryData);
    await dispatch(fetchAllFoodCategories());
    return response.data.data as FoodCategory;
  } catch (error: any) {
    console.log(error)
    return rejectWithValue(error?.response?.data?.message || "Failed to create order");
  }
});
