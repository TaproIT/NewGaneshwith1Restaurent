import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { BeverageItem } from "@/component/beach-&-pool-restaurant/beverage-model";

/**
 * Async thunk to add a table into specific order
 */
export const addNewBeverage = createAsyncThunk<
  BeverageItem,
  BeverageItem
>("beverage/addNewBeverage", async (beverageItem:BeverageItem, { rejectWithValue }) => {
  try {
    const response = await api.post(`/beverages`,beverageItem);
    return response.data.data.order as BeverageItem;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to add table into order");
  }
});
