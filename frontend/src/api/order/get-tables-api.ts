import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { Table } from "@/component/beach-&-pool-restaurant/order-model";
import type { RootState } from "@/app/store";

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchAllTables = createAsyncThunk<
  Table[],
  void,
  {state: RootState}
>(`order/fetchAllTables?restaurantType=`, async ( __ ,{ getState, rejectWithValue }) => {
  try {
    const { user } = getState();
    const response = await api.get(`/order/table?restaurantType=${user.restaurantType}`);
    return response.data.data.tables as Table[];
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
