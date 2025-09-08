import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { BeverageCategory } from "@/component/beach-&-pool-restaurant/beverage-category-model";

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchAllBeverageCategories = createAsyncThunk<
  BeverageCategory[],
  void
>("beverageCategory/fetchAllBeverageCategories", async ( __ ,{ rejectWithValue }) => {
  try {
    const response = await api.get(`/pbfoodcategories`);
    console.log(response);
    return response.data as BeverageCategory[];
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
