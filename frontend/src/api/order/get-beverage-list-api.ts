import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { BeverageItem } from "@/component/beach-&-pool-restaurant/beverage-model";

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchAllBeverageItems = createAsyncThunk<
  BeverageItem[],
  void
>("beverage/fetchAllFoodItems", async ( __ ,{ rejectWithValue }) => {
  try {
    const response = await api.get(`/pbfoodnets`);
    console.log(response);
    return response.data as BeverageItem[];
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
