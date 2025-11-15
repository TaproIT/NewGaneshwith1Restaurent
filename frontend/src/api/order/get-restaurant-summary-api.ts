import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { RootState } from "@/app/store";
import type { RestaurantSummary } from "@/component/beach-&-pool-restaurant/restaurant-summary-model";


interface RestaurantSummaryFilters {
    startDate: string;
    endDate: string;
}
/**
 * Async thunk to fetch daily order summary
 */
export const fetchRestaurantSummary = createAsyncThunk<
  RestaurantSummary,
  RestaurantSummaryFilters,
  { state: RootState }
>(
  "restaurantSummary/fetchRestaurantSummary",
  async (filters:RestaurantSummaryFilters, { getState, rejectWithValue }) => {
    try {
      //const { dailyOrderSummary } = getState();

      const response = await api.get(
        `/order/restaurant/summary?startDate=${filters.startDate}&endDate=${filters.endDate}`
      );
      console.log(response.data);
      return response.data as RestaurantSummary;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || "Failed to fetch order");
    }
  }
);
