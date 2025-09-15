import { fetchOrderById } from "@/api/order/get-order-data-api";
import { createOrderWithInitialData } from "@/api/order/add-order-initial-data-api";
import type { Order, OrderBeverageItem, OrderFoodItem} from "@/component/beach-&-pool-restaurant/order-model";
import { CustomerTypes, RestaurantTypes, ServiceTypes } from "@/lib/enums/order-related-enums";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { fetchAllTables } from "@/api/order/get-tables-api";
import { addTableToOrder } from "@/api/order/add-table-to-order-api";
import { addNewOrderTokenToOrder } from "@/api/order/add-new-order-token-to-order-api";
import { fetchAllAvailableRooms } from "@/api/order/get-available-rooms-with-guest-details-api";

/**
 * Initial state for the Order slice.
 */
const initialState: Order = {
  _id: "",
  orderNumber: 0,
  orderStatus: 0,
  customerType: CustomerTypes.CHECKED_IN.value,  
  serviceType: ServiceTypes.DINE_IN.value,
  restaurantType: RestaurantTypes.BEACH.value, 
  rooms: [],     
  roomNumber: "",            
  guestName: "",
  guestId: "",              
  tableId: null,
  tables: [],
  restaurantTable: null,
  isOrderTokenOpen: false,
  orderTokens: [],
  newOrderToken: {
      _id: "",
      tokenId: "",
      tokenNumber: 1,
      isPrinted: false,
      isHold: false,
      foodOrders: [],
      beverageOrders: [],
      tokenSubTotal: 0,
      tokenTax: 0,
      tokenDiscount: 0,
      tokenServiceCharge: 0,
      tokenTotalBill: 0
   },
  holdOrderToken: null,
  isAddNewOrderToken: false,
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
  addNewOrderTokenStatus: {
    error: null,
    loading: false,
  },
  fetchAvailableBookedRoomsStatus: {
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

    setRestaurantType: (state, action: PayloadAction<string>) => {
      state.restaurantType = action.payload;
    },

    setRoomNumber: (state, action: PayloadAction<string>) => {
      state.roomNumber = action.payload;
    },

    setGuestName: (state, action: PayloadAction<string>) => {
      state.guestName = action.payload;
    },

    resetOrderData: () => initialState,

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
      state.newOrderToken?.foodOrders.push(action.payload);
    },

    addBeverageItemToOrderToken: (state, action: PayloadAction<OrderBeverageItem>) => {
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
      state.newOrderToken?.beverageOrders.push(action.payload);
    },

    removeFoodItemFromOrderToken: (state, action: PayloadAction<number>) => {
      if (state.newOrderToken?.foodOrders) {
        state.newOrderToken.foodOrders.splice(action.payload, 1);
      }
    },

    removeBeverageItemFromOrderToken: (state, action: PayloadAction<number>) => {
      if (state.newOrderToken?.beverageOrders) {
        state.newOrderToken.beverageOrders.splice(action.payload, 1);
      }
    },

    removeAllOrderItemsFromToken: (state) => {
       if (state.newOrderToken?.foodOrders) {
        state.newOrderToken.foodOrders = [];
      }
      if (state.newOrderToken?.beverageOrders) {
        state.newOrderToken.beverageOrders = [];
      }
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
        const foodItem = token?.foodOrders.find(
          (item) => item.foodId === action.payload
        );

        // if found, increase quantity
        if (foodItem) {
          foodItem.quantity += 1;
        }
    },

    increaseBeverageQuantity: (state, action: PayloadAction<string>) => {
     
        const token = state.newOrderToken;

        // find the beverage item by id
        const beverageItem = token?.beverageOrders.find(
          (item) => item.beverageId === action.payload
        );

        // if found, increase quantity
        if (beverageItem) {
          beverageItem.quantity += 1;
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
        const foodItem = token?.foodOrders.find(
          (item) => item.foodId === action.payload
        );

        // if found, increase quantity
        if (foodItem && (foodItem.quantity > 1)) {
          foodItem.quantity -= 1;
        }
    },

     decreaseBeverageQuantity: (state, action: PayloadAction<string>) => {

        const token = state.newOrderToken;

         // find the beverage item by id
        const beverageItem = token?.beverageOrders.find(
          (item) => item.beverageId === action.payload
        );

        // if found, decrease quantity
        if (beverageItem && (beverageItem.quantity > 1)) {
          beverageItem.quantity -= 1;
        }
    },

    setIsPrintedForNewOrderToken: (state, action: PayloadAction<boolean>) => {
       state.newOrderToken.isPrinted = action.payload;
    },

    setIsHoldForNewOrderToken: (state, action: PayloadAction<boolean>) => {
       state.newOrderToken.isHold = action.payload;
    },
    
    setIsAddNewOrderToken: (state, action: PayloadAction<boolean>) => {
       state.isAddNewOrderToken = action.payload;
       state.newOrderToken.tokenNumber = state.orderTokens.length + 1;
    },

    setTokenSubTotal: (state, action: PayloadAction<number>) => {
       state.newOrderToken.tokenSubTotal = action.payload;
    },

    setTokenTax: (state, action: PayloadAction<number>) => {
      state.newOrderToken.tokenTax = action.payload;
    },

    setTokenDiscount: (state, action: PayloadAction<number>) => {
      state.newOrderToken.tokenDiscount = action.payload;
    },

    setTokenServiceCharge: (state, action: PayloadAction<number>) => {
      state.newOrderToken.tokenServiceCharge = action.payload;
    },

    setTokenTotalBill: (state, action: PayloadAction<number>) => {
      state.newOrderToken.tokenTotalBill = action.payload;
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
      .addCase(fetchAllAvailableRooms.pending, (state) => {
        state.fetchAvailableBookedRoomsStatus.loading = true;
        state.fetchAvailableBookedRoomsStatus.error = null;
      })
      .addCase(fetchAllAvailableRooms.fulfilled, (state, action) => {
        state.fetchAvailableBookedRoomsStatus.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchAllAvailableRooms.rejected, (state, action) => {
        state.fetchAvailableBookedRoomsStatus.loading = false;
        state.fetchAvailableBookedRoomsStatus.error = action.payload as string;
      })

      .addCase(createOrderWithInitialData.pending, (state) => {
        state.orderInitialDataStatus.loading = true;
        state.orderInitialDataStatus.error = null;
      })
      .addCase(createOrderWithInitialData.fulfilled, (state, action) => {
        state.orderInitialDataStatus.loading = false;
        state._id = action.payload._id;
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

        // // Find the token that is not printed (hold token)
        // const holdOrderToken = action.payload.orderTokens.find(
        //   (token) => token.isPrinted === false
        // );

        // if (holdOrderToken) {
        //   // Keep all tokens except the hold token
        //   const filteredTokens = action.payload.orderTokens.filter(
        //     (token) => token !== holdOrderToken
        //   );

        //   // Assign hold token as the new order token
        //   action.payload.newOrderToken = holdOrderToken;

        //   // Update tokens without duplicating the hold token
        //   action.payload.orderTokens = filteredTokens;

        //   action.payload.isAddNewOrderToken = true;

        //   // Merge into state
        //   Object.assign(state, action.payload);
        //   return;
        //}

        // If no hold token, just replace with 
        if( action.payload.holdOrderToken ) {
            action.payload.newOrderToken = action.payload.holdOrderToken;
        }
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
    })

    // Add new order token to order
    .addCase(addNewOrderTokenToOrder.pending, (state) => {
       state.addNewOrderTokenStatus = { loading: true, error: null };
    })
    .addCase(addNewOrderTokenToOrder.fulfilled, (state) => {
      state.isOrderTokenOpen = false;
      state.isAddNewOrderToken = false;
      state.newOrderToken = {
        _id: "",
        tokenId: "",
        tokenNumber: 1,
        isPrinted: false,
        isHold: false,
        foodOrders: [],
        beverageOrders: [],
        tokenSubTotal: 0,
        tokenTax: 0,
        tokenDiscount: 0,
        tokenServiceCharge: 0,
        tokenTotalBill: 0
      }
    })
    .addCase(addNewOrderTokenToOrder.rejected, (state, action) => {
       state.addNewOrderTokenStatus = { loading: false, error: action.payload as string };
    });
  },

});

// Export actions to dispatch them in components
export const { 
  setCustomerType, 
  setServiceType,
  setRestaurantType, 
  setRoomNumber, 
  setGuestName,
  resetOrderData,
  setTableId,
  addFoodItemToOrderToken,
  addBeverageItemToOrderToken,
  removeFoodItemFromOrderToken,
  removeBeverageItemFromOrderToken,
  removeAllOrderItemsFromToken,
  openOrderTokenModal,
  closeOrderTokenModal,
  setOrderTokenModal,
  increaseQuantity,
  increaseBeverageQuantity,
  decreaseQuantity,
  decreaseBeverageQuantity,
  setIsPrintedForNewOrderToken,
  setIsHoldForNewOrderToken,
  setIsAddNewOrderToken,
  setTokenTax,
  setTokenDiscount,
  setTokenServiceCharge,
  setTokenTotalBill,
  setTokenSubTotal,
  setTax,
  setDiscount,
  setServiceCharge,
  setTotalBill,
  setSubTotal
} = orderSlice.actions;

// Export the reducer to include in the Redux store
export default orderSlice.reducer;
