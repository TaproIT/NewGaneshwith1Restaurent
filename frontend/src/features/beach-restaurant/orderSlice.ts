import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/**
 * Interface defining the structure of the Order state in Redux.
 */
interface OrderState {
  customerType: string;       // Type of customer (e.g., checkedIn, walkIn)
  serviceType: string;        // Type of service (e.g., dineIn, takeaway)
  roomNumber: string;         // Room number if applicable
  guestName: string;          // Name of the guest
  tableId: string | null;     // Currently selected table ID (null if none)
}

/**
 * Initial state for the Order slice.
 */
const initialState: OrderState = {
  customerType: "checkedIn",  // Default customer type
  serviceType: "dineIn",      // Default service type
  roomNumber: "",             // No room assigned initially
  guestName: "",              // Guest name empty initially
  tableId: null,              // No table selected initially
};

/**
 * Redux slice for managing order-related state.
 */
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    /**
     * Set the customer type.
     * @param state Current state
     * @param action Payload containing the new customer type
     */
    setCustomerType: (state, action: PayloadAction<string>) => {
      state.customerType = action.payload;
    },

    /**
     * Set the service type.
     * @param state Current state
     * @param action Payload containing the new service type
     */
    setServiceType: (state, action: PayloadAction<string>) => {
      state.serviceType = action.payload;
    },

    /**
     * Set the room number.
     * @param state Current state
     * @param action Payload containing the room number
     */
    setRoomNumber: (state, action: PayloadAction<string>) => {
      state.roomNumber = action.payload;
    },

    /**
     * Set the guest name.
     * @param state Current state
     * @param action Payload containing the guest name
     */
    setGuestName: (state, action: PayloadAction<string>) => {
      state.guestName = action.payload;
    },

    /**
     * Set the selected table ID.
     * @param state Current state
     * @param action Payload containing the table ID or null
     */
    setTableId: (state, action: PayloadAction<string | null>) => {
      state.tableId = action.payload;
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
} = orderSlice.actions;

// Export the reducer to include in the Redux store
export default orderSlice.reducer;
