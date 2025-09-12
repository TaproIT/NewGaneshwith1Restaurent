import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { AvailableBookedRoom } from "@/component/beach-&-pool-restaurant/order-model";

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchAllAvailableRooms = createAsyncThunk<
  AvailableBookedRoom[],
  void
>("order/fetchAllAvailableRooms", async ( __ ,{ rejectWithValue }) => {
  try {
    const response = await api.get(`/booking/details/all-rooms`);
    return response.data.rooms as AvailableBookedRoom[];
  } catch (error: any) {
    return rejectWithValue("Failed to fetch room data");
  }
});
