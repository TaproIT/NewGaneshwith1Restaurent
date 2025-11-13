import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/axios"; // your axios instance with interceptor
import type { Booking } from "@/types/guestDetails";

// Thunk to fetch room booking details
export const fetchRoomBooking = createAsyncThunk(
  "booking/fetchRoomBooking",
  async (roomNo: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/booking/active-rooms-with-prices/${roomNo}`);
      console.log(res.data)
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Something went wrong");
    }
  }
);

interface BookingState {
  roomData: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  roomData: null,
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBooking: (state) => {
      state.roomData = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoomBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.roomData = action.payload;
      })
      .addCase(fetchRoomBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
