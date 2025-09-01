import type { Order } from "@/component/beach-&-pool-restaurant/order-model";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchOrderById = createAsyncThunk<
  Order,
  string
>("order/fetchOrderById", async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/order/${orderId}`);
    console.log(response);
    return response.data.data.order as Order;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
