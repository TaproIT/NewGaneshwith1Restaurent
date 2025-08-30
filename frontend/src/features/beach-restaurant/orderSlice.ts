// store/orderSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface OrderState {
  customerType: string;
  serviceType: string;
  roomNumber: string;
  guestName: string;
}

const initialState: OrderState = {
  customerType: "checkedIn", // default
  serviceType: "dineIn",     // default
  roomNumber: "",
  guestName: "",
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setCustomerType: (state, action: PayloadAction<string>) => {
      state.customerType = action.payload;
    },
    setServiceType: (state, action: PayloadAction<string>) => {
      state.serviceType = action.payload;
    },
    setRoomNumber: (state, action: PayloadAction<string>) => {
      state.roomNumber = action.payload;
    },
    setGuestName: (state, action: PayloadAction<string>) => {
      state.guestName = action.payload;
    },
  },
});

export const { setCustomerType, setServiceType, setRoomNumber, setGuestName } =
  orderSlice.actions;

export default orderSlice.reducer;
