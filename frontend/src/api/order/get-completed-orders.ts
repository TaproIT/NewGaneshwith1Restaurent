import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { RootState } from "@/app/store";

interface CompletedOrdersFilters {
  fromDate: string;
  toDate: string;
  searchText?: string;
  page?: number;
  limit?: number;
}

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

interface CompletedOrdersResponse {
  orders: CompletedOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Async thunk to fetch completed orders
 */
export const fetchCompletedOrders = createAsyncThunk<
  CompletedOrdersResponse,
  CompletedOrdersFilters,
  { state: RootState }
>(
  "completedOrders/fetchCompletedOrders",
  async (filters: CompletedOrdersFilters, { rejectWithValue }) => {
    try {
      const { fromDate, toDate, searchText = "", page = 1, limit = 10 } = filters;

      const response = await api.get(
        `/order/completed-orders/list?fromDate=${fromDate}&toDate=${toDate}&searchText=${searchText}&page=${page}&limit=${limit}`
      );

      return response.data.data as CompletedOrdersResponse;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch completed orders"
      );
    }
  }
);
