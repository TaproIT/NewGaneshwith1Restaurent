import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { BeverageCategory } from "@/component/beach-&-pool-restaurant/beverage-category-model";
import { fetchAllBeverageCategories } from "./get-beverage-categories-api";
import { fetchAllExtraBeverageCategories } from "./get-extra-beverge-categories-api";

interface AddExtraBeverageCategory {
  name: string;
}

/**
 * Async thunk to add a new food category
 */
export const addNewExtraBeverageCategory = createAsyncThunk<
  BeverageCategory,
  AddExtraBeverageCategory
>(
  "beverageCategory/addNewExtraBeverageCategory",
  async (beverageCategory: AddExtraBeverageCategory, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/extra-beverages/category`, beverageCategory);
      await dispatch(fetchAllExtraBeverageCategories());
      return response.data.data as BeverageCategory;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to add food category"
      );
    }
  }
);
