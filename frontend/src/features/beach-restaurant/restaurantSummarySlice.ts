import { fetchRestaurantSummary } from "@/api/order/get-restaurant-summary-api";
import type { RestaurantSummary } from "@/component/beach-&-pool-restaurant/restaurant-summary-model";
import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const initialState: RestaurantSummary = {
    startDate: "",
    endDate: "",
    restaurantType: "",
    totalIncome: 0,
    checkInIncome: 0,
    walkInIncome: 0,
    summaryList: [],
    fetchRestaurantSummaryStatus: {
        loading: false,
        error: null
    }
}


const restaurantSummarySlice = createSlice({
  name: "restaurantSummary",
  initialState,
  reducers: {
    resetDailySummaryData : () => initialState
  },
  
  extraReducers: (builder) => {
    builder
      //fetch restaurant summary
      .addCase(fetchRestaurantSummary.pending, (state) => {
        state.fetchRestaurantSummaryStatus.loading = true;
        state.fetchRestaurantSummaryStatus.error = null;
      })
      .addCase(fetchRestaurantSummary.fulfilled, (state, action) => {
        state.fetchRestaurantSummaryStatus.loading = false;
        if (state.summaryList) {
            state.summaryList = [];
        }
        state.summaryList = [...state.summaryList, ...action.payload.summaryList];
        state.totalIncome = action.payload.totalIncome;
        state.checkInIncome = action.payload.checkInIncome;
        state.walkInIncome = action.payload.walkInIncome;
      })
      .addCase(fetchRestaurantSummary.rejected, (state, action) => {
        state.fetchRestaurantSummaryStatus.loading = false;
        state.fetchRestaurantSummaryStatus.error = action.payload as string;
      })
  },
  
});

export const {resetDailySummaryData } = restaurantSummarySlice.actions;
export default restaurantSummarySlice.reducer;
