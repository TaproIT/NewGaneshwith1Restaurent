import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { ExtraBeverageItem } from "@/component/beach-&-pool-restaurant/beverage-model";
import { fetchAllExtraBeverageItems } from "./get-extra-beverage-list-api";

interface UpdateExtraBeverageItem {
  beverageId: string;  
  extraBeverageCategory:string | null;
  beverageName: string;
  price:number;
  isVisible?: boolean;
  isEnableBeverage:boolean;
  liquor: { beverage: string, amount: number }[];
}
/**
 * Async thunk to add a table into specific order
 */
export const updateExtraBeverage = createAsyncThunk<
  ExtraBeverageItem,
  UpdateExtraBeverageItem
>("beverage/updateExtraBeverage", async (beverageItem:UpdateExtraBeverageItem, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.put(`/extra-beverages/${beverageItem.beverageId}`,beverageItem);
    await dispatch(fetchAllExtraBeverageItems());
    return response.data.data.order as ExtraBeverageItem;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data.message || "Failed to update beverage item");
  }
});
