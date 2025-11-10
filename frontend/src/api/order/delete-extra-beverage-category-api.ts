import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { BeverageCategory } from "@/component/beach-&-pool-restaurant/beverage-category-model";
import { fetchAllExtraBeverageCategories } from "./get-extra-beverge-categories-api";
import { fetchAllFoodCategories } from "./get-food-categories-api";
import { fetchAllFoodItems } from "./get-food-list-api";


interface DeleteExtraBeverageCategoryRequest {
  categoryId: string | null;
}



export const deleteExtraBeverageCategory = createAsyncThunk<
  BeverageCategory,
  DeleteExtraBeverageCategoryRequest
>("beverageCategory/deleteExtraBeverageCategory",  async (extraBeverageCategoryData, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.delete(`/extra-beverages/category/${extraBeverageCategoryData.categoryId}`);
    await dispatch(fetchAllExtraBeverageCategories());
    return response.data.data as BeverageCategory;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to update food category");
  }
});
