import type { Order } from "@/component/beach-&-pool-restaurant/order-model";
import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


interface UpdateOrderRequest {
  orderId: string;
  subTotal:number;
  tax:number;
  serviceCharge:number;
  totalBill: number;
  paymentMethod:string | null;
}



export const updateOrderBillDetails = createAsyncThunk<
  Order,
  UpdateOrderRequest
>("order/updateOrderBillDetails",  async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/order/${orderData.orderId}/bill-details`, orderData);
    return response.data.data.order as Order;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to update bill details");
  }
});
