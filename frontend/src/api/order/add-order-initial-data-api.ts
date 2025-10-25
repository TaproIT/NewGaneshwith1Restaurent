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
  guestId?: string;
}

/**
 * Response type for created order (adjust according to backend response)
 */
interface CreateOrderResponse {
  _id: string;
  orderNumber: number;
  orderStatus: number;
  serviceType: string;
  guestId?: string;
  restaurantType: string;
}

export const createOrderWithInitialData = createAsyncThunk<
  CreateOrderResponse,
  CreateOrderRequest
>("order/createOrderWithInitialData",  async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.post("/order", orderData);
    return response.data.data.order as CreateOrderResponse;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || "Failed to create order");
  }
});
