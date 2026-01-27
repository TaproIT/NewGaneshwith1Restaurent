import { fetchCompletedOrders } from "@/api/order/get-completed-orders";
import { createSlice } from "@reduxjs/toolkit";

interface OrderToken {
  _id: string;
  foodOrders: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  beverageOrders: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
}

interface CompletedOrder {
  _id: string;
  orderNumber: string;
  roomNumber: string;
  guestName: string;
  customerType: string;
  serviceType: string;
  restaurantType: string;
  subTotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  totalBill: number;
  paymentMethod: string;
  createdAt: string;
  orderTokens: OrderToken[];
}

interface CompletedOrdersState {
  orders: CompletedOrder[];
  fromDate: string;
  toDate: string;
  searchText: string;
  fetchCompletedOrdersStatus: {
    loading: boolean;
    error: string | null;
  };
}

const initialState: CompletedOrdersState = {
  orders: [],
  fromDate: new Date().toISOString(),
  toDate: new Date().toISOString(),
  searchText: "",
  fetchCompletedOrdersStatus: {
    loading: false,
    error: null,
  },
};

const completedOrdersSlice = createSlice({
  name: "completedOrders",
  initialState,
  reducers: {
    setFromDate: (state, action) => {
      state.fromDate = action.payload;
    },
    setToDate: (state, action) => {
      state.toDate = action.payload;
    },
    setSearchText: (state, action) => {
      state.searchText = action.payload;
    },
    resetCompletedOrdersData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompletedOrders.pending, (state) => {
        state.fetchCompletedOrdersStatus.loading = true;
        state.fetchCompletedOrdersStatus.error = null;
      })
      .addCase(fetchCompletedOrders.fulfilled, (state, action) => {
        state.fetchCompletedOrdersStatus.loading = false;
        state.orders = action.payload.orders;
      })
      .addCase(fetchCompletedOrders.rejected, (state, action) => {
        state.fetchCompletedOrdersStatus.loading = false;
        state.fetchCompletedOrdersStatus.error = action.payload as string;
      });
  },
});

export const { setFromDate, setToDate, setSearchText, resetCompletedOrdersData } =
  completedOrdersSlice.actions;
export default completedOrdersSlice.reducer;
