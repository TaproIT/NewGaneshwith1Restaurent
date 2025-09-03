import type { Order } from "@/component/beach-&-pool-restaurant/order-model";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";

interface AddTableData {
    orderId: string;
    tableId: string;
}
/**
 * Async thunk to add a table into specific order
 */
export const addTableToOrder = createAsyncThunk<
  Order,
  AddTableData
>("order/addTableToOrder", async (tableData:AddTableData, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/order/${tableData.orderId}`,{tableId: tableData.tableId});
    console.log(response);
    return response.data.data.order as Order;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed to add table into order");
  }
});
