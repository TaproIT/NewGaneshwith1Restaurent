import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { DailyOrderSummary } from "@/component/beach-&-pool-restaurant/daily-summary-model";
import type { RootState } from "@/app/store";

/**
 * Async thunk to fetch daily order summary
 */
export const fetchDailyOrderSummary = createAsyncThunk<
  DailyOrderSummary,
  void,
  { state: RootState }
>(
  "dailyOrderSummary/fetchDailyOrderSummary",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { dailyOrderSummary } = getState();

      const response = await api.get(
        `/order/daily-summary?date=${dailyOrderSummary.date}`
      );

      return response.data.data as DailyOrderSummary;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || "Failed to fetch order");
    }
  }
);
