import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { BeverageItem } from "@/component/beach-&-pool-restaurant/beverage-model";

interface AddExtraBeverageItem {
  extraBeverageCategory:string | null;
  beverageName: string;
  price:number;
  isVisible: boolean;
}
/**
 * Async thunk to add a table into specific order
 */
export const addNewExtraBeverage = createAsyncThunk<
  BeverageItem,
  AddExtraBeverageItem
>("beverage/addNewExtraBeverage", async (extraBeverageItem:AddExtraBeverageItem, { rejectWithValue }) => {
  try {
    const response = await api.post(`/extra-beverages`,extraBeverageItem);
    return response.data.data.order as BeverageItem;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data.message || "Failed to add beverage item");
  }
});
