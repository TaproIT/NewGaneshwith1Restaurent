import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { BeverageCategory } from "@/component/beach-&-pool-restaurant/beverage-category-model";
import { fetchAllExtraBeverageCategories } from "./get-extra-beverge-categories-api";


interface UpdateExtraBeverageCategoryRequest {
  categoryId: string | null;
  name: string;
}



export const updateExtraBeverageCategory = createAsyncThunk<
  BeverageCategory,
  UpdateExtraBeverageCategoryRequest
>("beverageCategory/updateExtraBeverageCategory",  async (extraBeverageCategoryData, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.put(`/extra-beverages/category/${extraBeverageCategoryData.categoryId}`, extraBeverageCategoryData);
    await dispatch(fetchAllExtraBeverageCategories());
    return response.data.data as BeverageCategory;
  } catch (error: any) {
    console.log(error)
    return rejectWithValue(error?.response?.data?.message || "Failed to update extra beverage category");
  }
});
