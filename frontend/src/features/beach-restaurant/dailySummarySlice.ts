import { fetchDailyOrderSummary } from "@/api/order/get-daily-order-summary";
import type { DailyOrderSummary } from "@/component/beach-&-pool-restaurant/daily-summary-model";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: DailyOrderSummary = {
    date: new Date().toISOString(),
     summary: {
       dineInCount: 0,
       takeAwayCount: 0,
       saveToRoomCount: 0,
       totalOrders: 0
     },
     orders: [],
     selectedOrderId: "",
     fetchDailyOrderSummaryStatus: {
        loading: false,
        error: null
     }
}
const holdOrderSlice = createSlice({
  name: "dailyOrderSummary",
  initialState,
  reducers: {
    setSelectedOrderId : (state, action:PayloadAction<string>) => {
       state.selectedOrderId = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.date = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    builder
      //fetch daily order summary
      .addCase(fetchDailyOrderSummary.pending, (state) => {
        state.fetchDailyOrderSummaryStatus.loading = true;
        state.fetchDailyOrderSummaryStatus.error = null;
      })
      .addCase(fetchDailyOrderSummary.fulfilled, (state, action) => {
        state.fetchDailyOrderSummaryStatus.loading = false;
        if (state.orders) {
            state.orders = [];
        }
        state.orders = [...state.orders, ...action.payload.orders];
        state.summary = {...state.summary, ...action.payload.summary};
      })
      .addCase(fetchDailyOrderSummary.rejected, (state, action) => {
        state.fetchDailyOrderSummaryStatus.loading = false;
        state.fetchDailyOrderSummaryStatus.error = action.payload as string;
      })
  },
  
});

export const { setSelectedOrderId, setSelectedDate } = holdOrderSlice.actions;
export default holdOrderSlice.reducer;
