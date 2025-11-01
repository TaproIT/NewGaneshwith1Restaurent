import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { BeverageItem } from "@/component/beach-&-pool-restaurant/beverage-model";

/**
 * Async thunk to fetch all extra beverages
 */
export const fetchAllExtraBeverageItems = createAsyncThunk<
  BeverageItem[],
  void
>("beverage/fetchAllExtraBeverageItems", async ( __ ,{ rejectWithValue }) => {
  try {
    const response = await api.get(`/extra-beverages`);
    return response.data.data as BeverageItem[];
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
