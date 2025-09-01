import type { Order } from "@/component/beach-&-pool-restaurant/order-model";
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

/**
 * Response type for fetching a specific order
 */
interface GetOrderResponse {
  _id: string;
  orderNumber: number;
  orderStatus: number;
  serviceType: string;
  customerType: string;
  roomNumber?: number;
  guestName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Async thunk to fetch a specific order by ID
 */
export const fetchOrderById = createAsyncThunk<
  Order,
  string
>("order/fetchOrderById", async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/order/${orderId}`);
    console.log(response);
    return response.data.data.order as Order;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to fetch order");
  }
});
