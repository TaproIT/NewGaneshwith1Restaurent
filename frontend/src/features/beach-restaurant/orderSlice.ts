import type { OrderFoodItem, OrderTokenType } from "@/component/beach-&-pool-restaurant/order-model";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/**
 * Interface defining the structure of the Order state in Redux.
 */
interface OrderState {
  orderId: string;
  orderNumber: number;
  orderStatus: string;
  customerType: string;       
  serviceType: string;        
  roomNumber: string;         
  guestName: string;          
  tableId: string | null; 
  isOrderTokenOpen: boolean;
  orderTokens: OrderTokenType [];
  newOrderToken: OrderTokenType; 
  subTotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  totalBill: number;  
}

/**
 * Initial state for the Order slice.
 */
const initialState: OrderState = {
  orderId: "1234sfsefsfsdkkxkfkdk",
  orderNumber: 1234567,
  orderStatus: "Processing",
  customerType: "checked-in",  
  serviceType: "dine-in",      
  roomNumber: "",            
  guestName: "",              
  tableId: null,
  isOrderTokenOpen: false,
  orderTokens: [],
  newOrderToken: {
      tokenId: "",
      tokenNumber: 1,
      isPrinted: false,
      isHold: false,
      foodItems: [],
      beverageItems: []
   },
  subTotal: 0,
  tax: 0,
  discount: 0,
  serviceCharge: 0,
  totalBill: 0  
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

    addFoodItemToOrderToken: (state, action: PayloadAction<OrderFoodItem>) => {
      // if (state.orderTokens && state.orderTokens.length > 0) {
      //   // get the last token
      //   const lastToken = state.orderTokens[state.orderTokens.length - 1];

      //   // make sure foodItems array exists
      //   if (!lastToken.foodItems) {
      //     lastToken.foodItems = [];
      //   }

      //   // push the new item
      //   lastToken.foodItems.push(action.payload);
      // }
      state.newOrderToken?.foodItems.push(action.payload);
    },

    increaseQuantity: (state, action: PayloadAction<string>) => {
      // if (state.orderTokens && state.orderTokens.length > 0) {
      //   // get the last token
      //   const lastToken = state.orderTokens[state.orderTokens.length - 1];

      //   // make sure foodItems array exists
      //   if (!lastToken.foodItems) {
      //     lastToken.foodItems = [];
      //   }

      //   // find the food item by id
      //   const foodItem = lastToken.foodItems.find(
      //     (item) => item.foodId === action.payload
      //   );

      //   // if found, increase quantity
      //   if (foodItem) {
      //     foodItem.quantity += 1;
      //   }
      // }
        const token = state.newOrderToken;

        // find the food item by id
        const foodItem = token?.foodItems.find(
          (item) => item.foodId === action.payload
        );

        // if found, increase quantity
        if (foodItem) {
          foodItem.quantity += 1;
        }
    },

    decreaseQuantity: (state, action: PayloadAction<string>) => {
      // if (state.orderTokens && state.orderTokens.length > 0) {
      //   // get the last token
      //   const lastToken = state.orderTokens[state.orderTokens.length - 1];

      //   // make sure foodItems array exists
      //   if (!lastToken.foodItems) {
      //     lastToken.foodItems = [];
      //   }

      //   // find the food item by id
      //   const foodItem = lastToken.foodItems.find(
      //     (item) => item.foodId === action.payload
      //   );

      //   // if found, increase quantity
      //   if (foodItem && (foodItem.quantity > 1) ) {
      //     foodItem.quantity -= 1;
      //   }
      // }

        const token = state.newOrderToken;

        // find the food item by id
        const foodItem = token?.foodItems.find(
          (item) => item.foodId === action.payload
        );

        // if found, increase quantity
        if (foodItem && (foodItem.quantity > 1)) {
          foodItem.quantity -= 1;
        }
    },
    
    setSubTotal: (state, action: PayloadAction<number>) => {
      state.subTotal = action.payload;
    },

    setTax: (state, action: PayloadAction<number>) => {
      state.tax = action.payload;
    },

    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
    },

    setServiceCharge: (state, action: PayloadAction<number>) => {
      state.serviceCharge = action.payload;
    },

    setTotalBill: (state, action: PayloadAction<number>) => {
      state.totalBill = action.payload;
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
  addFoodItemToOrderToken,
  openOrderTokenModal,
  closeOrderTokenModal,
  setOrderTokenModal,
  increaseQuantity,
  decreaseQuantity,
  setTax,
  setDiscount,
  setServiceCharge,
  setTotalBill,
  setSubTotal
} = orderSlice.actions;

// Export the reducer to include in the Redux store
export default orderSlice.reducer;
