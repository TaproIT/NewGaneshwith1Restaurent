import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { DailyOrderSummary } from "@/component/beach-&-pool-restaurant/daily-summary-model";
import type { RootState } from "@/app/store";

interface DailySummaryFilters {
    startDate: string;
    endDate: string;
    restaurantType: string;
}
/**
 * Async thunk to fetch daily order summary
 */
export const fetchDailyOrderSummary = createAsyncThunk<
  DailyOrderSummary,
  DailySummaryFilters,
  { state: RootState }
>(
  "dailyOrderSummary/fetchDailyOrderSummary",
  async (filter:DailySummaryFilters, { getState, rejectWithValue }) => {
    try {
      const { dailyOrderSummary } = getState();

      const response = await api.get(
        `/order/daily-summary?startDate=${filter.startDate}&endDate=${filter.endDate}&restaurantType=${filter.restaurantType}`
      );

      return response.data.data as DailyOrderSummary;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || "Failed to fetch order");
    }
  }
);
