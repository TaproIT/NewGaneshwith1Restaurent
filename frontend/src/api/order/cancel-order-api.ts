import type { Order } from "@/component/beach-&-pool-restaurant/order-model";
import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


interface CancelOrderRequest {
  orderId: string;
}



export const cancelOrder = createAsyncThunk<
  Order,
  CancelOrderRequest
>("order/cancelOrder",  async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/order/${orderData.orderId}/cancel`);
    return response.data.data.order as Order;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to cancel order");
  }
});
