import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { BeverageItem } from "@/component/beach-&-pool-restaurant/beverage-model";

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchAllBeverageItems = createAsyncThunk<
  BeverageItem[],
  void
>("beverage/fetchAllBeverageItems", async ( __ ,{ rejectWithValue }) => {
  try {
    const response = await api.get(`/beverages`);
    return response.data.data as BeverageItem[];
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
