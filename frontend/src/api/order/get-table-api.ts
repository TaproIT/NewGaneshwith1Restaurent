import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { Table } from "@/component/beach-&-pool-restaurant/order-model";

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchOrderById = createAsyncThunk<
  Table,
  string
>("order/fetchTableById", async ( orderId,{ rejectWithValue }) => {
  try {
    const response = await api.get(`/order/table/${orderId}`);
    console.log(response);
    return response.data.data.tables as Table;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
