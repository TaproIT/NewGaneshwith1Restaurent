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
  page: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
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
  page: 1,
  limit: 6,
  totalOrders: 0,
  totalPages: 0,
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
      state.page = 1; // Reset to first page on filter change
    },
    setToDate: (state, action) => {
      state.toDate = action.payload;
      state.page = 1; // Reset to first page on filter change
    },
    setSearchText: (state, action) => {
      state.searchText = action.payload;
      state.page = 1; // Reset to first page on search
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1; // Reset to first page on limit change
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
        state.totalOrders = action.payload.pagination.total;
        state.totalPages = action.payload.pagination.totalPages;
        // Don't overwrite page/limit from response - trust the state
      })
      .addCase(fetchCompletedOrders.rejected, (state, action) => {
        state.fetchCompletedOrdersStatus.loading = false;
        state.fetchCompletedOrdersStatus.error = action.payload as string;
      });
  },
});

export const { setFromDate, setToDate, setSearchText, setPage, setLimit, resetCompletedOrdersData } =
  completedOrdersSlice.actions;
export default completedOrdersSlice.reducer;
