import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { Table } from "@/component/beach-&-pool-restaurant/order-model";

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchAllTables = createAsyncThunk<
  Table[],
  void
>("order/fetchAllTables", async ( __ ,{ rejectWithValue }) => {
  try {
    const response = await api.get(`/order/table`);
    console.log(response);
    return response.data.data.tables as Table[];
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
