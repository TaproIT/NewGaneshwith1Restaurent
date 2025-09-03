import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { FoodCategory } from "@/component/beach-&-pool-restaurant/food-category";

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchAllFoodCategories = createAsyncThunk<
  FoodCategory[],
  void
>("foodCategory/fetchAllFoodCategories", async ( __ ,{ rejectWithValue }) => {
  try {
    const response = await api.get(`/pbfoodcategories`);
    console.log(response);
    return response.data as FoodCategory[];
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
