import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { ExtraBeverageItem } from "@/component/beach-&-pool-restaurant/beverage-model";

interface AddExtraBeverageItem {
  extraBeverageCategory:string | null;
  beverageName: string;
  price:number;
  isVisible: boolean;
  liquor: { beverage: string, amount: number }[];
}
/**
 * Async thunk to add a table into specific order
 */
export const addNewExtraBeverage = createAsyncThunk<
  ExtraBeverageItem,
  AddExtraBeverageItem
>("beverage/addNewExtraBeverage", async (beverageItem:AddExtraBeverageItem, { rejectWithValue }) => {
  try {
    const response = await api.post(`/extra-beverages`,beverageItem);
    return response.data.data.order as ExtraBeverageItem;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data.message || "Failed to add beverage item");
  }
});
