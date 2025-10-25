import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { BeverageItem } from "@/component/beach-&-pool-restaurant/beverage-model";

interface AddBeverageItem {
  category:string | null;
  beverageName: string;
  price:number;
  isVisible: boolean;
  initialStock: number;
  note: string;
}
/**
 * Async thunk to add a table into specific order
 */
export const addNewBeverage = createAsyncThunk<
  BeverageItem,
  AddBeverageItem
>("beverage/addNewBeverage", async (beverageItem:AddBeverageItem, { rejectWithValue }) => {
  try {
    const response = await api.post(`/beverages`,beverageItem);
    return response.data.data.order as BeverageItem;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data.message || "Failed to add beverage item");
  }
});
