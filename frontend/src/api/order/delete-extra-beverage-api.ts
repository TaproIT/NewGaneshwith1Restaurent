import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ExtraBeverageItem } from "@/component/beach-&-pool-restaurant/beverage-model";
import { fetchAllExtraBeverageItems } from "./get-extra-beverage-list-api";


interface DeleteExtraBeverageItemRequest {
  beverageId: string;
}

export const deleteExtraBeverageItem = createAsyncThunk<
  ExtraBeverageItem,
  DeleteExtraBeverageItemRequest
>("beverage/deleteExtraBeverageItem",  async (beverageItemData, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.delete(`/extra-beverages/${beverageItemData.beverageId}`);
    await dispatch(fetchAllExtraBeverageItems());
    return response.data.data.beverageIem as ExtraBeverageItem;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to delete extra beverage item");
  }
});
