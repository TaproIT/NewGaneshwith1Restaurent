import { fetchOrderById } from "@/api/order/get-order-data-api";
import { createOrderWithInitialData } from "@/api/order/create-order-initial-data-api";
import type { Order, OrderFoodItem} from "@/component/beach-&-pool-restaurant/order-model";
import { CustomerTypes, ServiceTypes } from "@/lib/enums/order-related-enums";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { fetchAllTables } from "@/api/order/get-tables-api";
import { addTableToOrder } from "@/api/order/add-table-to-order-api";

/**
 * Initial state for the Order slice.
 */
const initialState: Order = {
  orderId: "",
  orderNumber: 0,
  orderStatus: 0,
  customerType: CustomerTypes.CHECKED_IN.value,  
  serviceType: ServiceTypes.DINE_IN.value,      
  roomNumber: "",            
  guestName: "",              
  tableId: null,
  tables: [],
  restaurantTable: null,
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
  totalBill: 0,
  orderInitialDataStatus: {
     error:null,
     loading: false,
  },
  fetchOrderDataStatus: {
     error:null,
     loading: false,
  }, 
    fetchTablesStatus: {
     error:null,
     loading: false,
  },
  addTableToOrderStatus: {
    error: null,
    loading: false,
  },
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

  extraReducers: (builder) => {
    builder
      .addCase(createOrderWithInitialData.pending, (state) => {
        state.orderInitialDataStatus.loading = true;
        state.orderInitialDataStatus.error = null;
      })
      .addCase(createOrderWithInitialData.fulfilled, (state, action) => {
        state.orderInitialDataStatus.loading = false;
        state.orderId = action.payload._id;
        state.orderNumber = action.payload.orderNumber;
        state.orderStatus = action.payload.orderStatus;
      })
      .addCase(createOrderWithInitialData.rejected, (state, action) => {
        state.orderInitialDataStatus.loading = false;
        state.orderInitialDataStatus.error = action.payload as string;
      })

      // Get order by ID
    .addCase(fetchOrderById.pending, (state) => {
      state.fetchOrderDataStatus = { loading: true, error: null };
    })
    .addCase(fetchOrderById.fulfilled, (state, action) => {
      state.fetchOrderDataStatus = { loading: false, error: null };
      Object.assign(state, action.payload);
    })
    .addCase(fetchOrderById.rejected, (state, action) => {
      state.fetchOrderDataStatus = { loading: false, error: action.payload as string };
    })

     // Get All Tables
    .addCase(fetchAllTables.pending, (state) => {
      state.fetchTablesStatus = { loading: true, error: null };
    })
    .addCase(fetchAllTables.fulfilled, (state, action) => {
      state.fetchTablesStatus = { loading: false, error: null };
      if (state.tables){
        state.tables = [];
      }
      state.tables = [...state.tables, ...action.payload]
    })
    .addCase(fetchAllTables.rejected, (state, action) => {
      state.fetchTablesStatus = { loading: false, error: action.payload as string };
    })

     // Add Table to Order
    .addCase(addTableToOrder.pending, (state) => {
      state.addTableToOrderStatus = { loading: true, error: null };
    })
    .addCase(addTableToOrder.fulfilled, (state, action) => {
      state.addTableToOrderStatus = { loading: false, error: null };
      Object.assign(state, action.payload);
    })
    .addCase(addTableToOrder.rejected, (state, action) => {
      state.addTableToOrderStatus = { loading: false, error: action.payload as string };
    });
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
