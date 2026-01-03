import type { Order } from "@/component/beach-&-pool-restaurant/order-model";
import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


interface UpdateBookingRequest {
  bookingId: string | undefined;
  orderId: string;
  date: Date;
}



export const updateBookingDetailsWithOrderId = createAsyncThunk<
  Order,
  UpdateBookingRequest
>("order/updateBookingDetails",  async (orderData, { rejectWithValue }) => {
    console.log(orderData);
  try {
    const response = await api.patch(`/booking/${orderData.bookingId}/add-order`, orderData);
    return response.data.data.order as Order;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to update booking details");
  }
});
