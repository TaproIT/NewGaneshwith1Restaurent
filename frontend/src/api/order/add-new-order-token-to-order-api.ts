import type { Order } from "@/component/beach-&-pool-restaurant/order-model";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";
import type { RootState } from "@/app/store";
import { fetchAllBeverageItems } from "./get-beverage-list-api";

/**
 * Async thunk to add a new order token into a specific order
 */
export const addNewOrderTokenToOrder = createAsyncThunk<
  Order,                             // Return type of the thunk
  { orderId: string },               // Argument type passed when dispatching
  { state: RootState }               // ThunkAPI type for getState
>(
  "order/addNewOrderTokenToOrder",
  async ({ orderId }, { getState, rejectWithValue, dispatch }) => {
    try {
      // Access the current order state from the store
      const { order } = getState();
      const {
        newOrderToken,
        subTotal,
        tax,
        discount,
        serviceCharge,
        totalBill,
      } = order;

      // Prepare the payload for the API request
      const payload = {
        newOrderToken,
        subTotal,
        tax,
        discount,
        serviceCharge,
        totalBill,
      };

      // Send the PATCH request to add a new order token
      const response = await api.patch(`/order/${orderId}/token`, {data:payload});
      await dispatch(fetchAllBeverageItems());
      // Return the updated order from the response
      return response.data.data.order as Order;
    } catch (error: any) {
      // Handle errors and return a meaningful message
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Failed to add new order token into order";
      return rejectWithValue(message);
    }
  }
);
