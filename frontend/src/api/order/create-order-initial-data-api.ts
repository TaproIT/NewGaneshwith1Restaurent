import { api } from "../axios";
import { createAsyncThunk } from "@reduxjs/toolkit";


/**
 * Request body type for creating an order
 */
interface CreateOrderRequest {
  customerType: string;
  serviceType: string;
  roomNumber: number;
  guestName: string;
}

/**
 * Response type for created order (adjust according to backend response)
 */
interface CreateOrderResponse {
  _id: string;
  orderNumber: number;
  orderStatus: number;
  serviceType: string;
}

export const createOrderWithInitialData = createAsyncThunk<
  CreateOrderResponse,
  CreateOrderRequest
>("order/createOrderWithInitialData",  async (orderData, { rejectWithValue }) => {
  try {
    console.log(orderData);
    const response = await api.post("/order", orderData);
    console.log(response.data.data.order);
    return response.data.data.order as CreateOrderResponse;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to create order");
  }
});
