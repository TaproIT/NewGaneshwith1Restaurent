import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { BeverageCategory } from "@/component/beach-&-pool-restaurant/beverage-category-model";

/**
 * Async thunk to fetch all extra beverage categories
 */
export const fetchAllExtraBeverageCategories = createAsyncThunk<
  BeverageCategory[],
  void
>("beverageCategory/fetchAllExtraBeverageCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(`/extra-beverages/category`);
    return response.data.data as BeverageCategory[];
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch extra beverage categories");
  }
});
