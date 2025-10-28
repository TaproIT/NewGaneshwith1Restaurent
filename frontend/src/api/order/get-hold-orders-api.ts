import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { HoldOrder } from "@/component/beach-&-pool-restaurant/hold-order-model";

/**
 * Async thunk to fetch all hold orders
 */
export const fetchHoldOrders = createAsyncThunk<
  HoldOrder[],
  void
>("order/fetchHoldOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/order/hold-orders");
    // Assuming your backend wraps data like { data: [...] }
    return response.data?.data as HoldOrder[];
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch hold orders");
  }
});
