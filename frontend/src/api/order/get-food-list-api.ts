import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { FoodItem } from "@/component/beach-&-pool-restaurant/food-model";

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchAllFoodItems = createAsyncThunk<
  FoodItem[],
  void
>("food/fetchAllFoodItems", async ( __ ,{ rejectWithValue }) => {
  try {
    const response = await api.get(`/pbfoodnets/available`);
    return response.data as FoodItem[];
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
