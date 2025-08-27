import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/**
 * Interface defining the structure of the Order state in Redux.
 */
interface OrderState {
  customerType: string;       
  serviceType: string;        
  roomNumber: string;         
  guestName: string;          
  tableId: string | null; 
  isOrderTokenOpen: boolean;    
}

/**
 * Initial state for the Order slice.
 */
const initialState: OrderState = {
  customerType: "checkedIn",  
  serviceType: "dineIn",      
  roomNumber: "",            
  guestName: "",              
  tableId: null,
  isOrderTokenOpen: false
};

/**
 * Redux slice for managing order-related state.
 */
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

    setTableId: (state, action: PayloadAction<string | null>) => {
      state.tableId = action.payload;
    },

    openOrderTokenModal: (state) => {
      state.isOrderTokenOpen = true;
    },
    closeOrderTokenModal: (state) => {
      state.isOrderTokenOpen = false;
    },
    setOrderTokenModal: (state, action: PayloadAction<boolean>) => {
      state.isOrderTokenOpen = action.payload;
    },
  },
});

// Export actions to dispatch them in components
export const { 
  setCustomerType, 
  setServiceType, 
  setRoomNumber, 
  setGuestName,
  setTableId,
  openOrderTokenModal,
  closeOrderTokenModal,
  setOrderTokenModal
} = orderSlice.actions;

// Export the reducer to include in the Redux store
export default orderSlice.reducer;
