import { fetchHoldOrders } from "@/api/order/get-hold-orders-api";
import { type HoldOrders } from "@/component/beach-&-pool-restaurant/hold-order-model";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: HoldOrders = {
    holdOrders: [],
    selectedHoldOrderId: "",
    fetchHoldOrdersStatus: {
     loading: false,
     error: null
   }
}
const holdOrderSlice = createSlice({
  name: "holdOrder",
  initialState,
  reducers: {
    setSelectedHoldOrderId : (state, action:PayloadAction<string>) => {
       state.selectedHoldOrderId = action.payload;
    }
  },
  
  extraReducers: (builder) => {
    builder
      //fetch hold orders
      .addCase(fetchHoldOrders.pending, (state) => {
        state.selectedHoldOrderId = "";
        state.holdOrders = [];
        state.fetchHoldOrdersStatus.loading = true;
        state.fetchHoldOrdersStatus.error = null;
      })
      .addCase(fetchHoldOrders.fulfilled, (state, action) => {
        state.fetchHoldOrdersStatus.loading = false;
        if (state.holdOrders) {
            state.holdOrders = [];
        }
        state.holdOrders = [...state.holdOrders, ...action.payload];
      })
      .addCase(fetchHoldOrders.rejected, (state, action) => {
        state.fetchHoldOrdersStatus.loading = false;
        state.fetchHoldOrdersStatus.error = action.payload as string;
      })
  },
  
});

export const { setSelectedHoldOrderId } = holdOrderSlice.actions;
export default holdOrderSlice.reducer;
