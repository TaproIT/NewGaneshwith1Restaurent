import { addNewBeverage } from "@/api/order/add-beverage-api";
import { fetchAllBeverageItems } from "@/api/order/get-beverage-list-api";
import type { BeverageItems } from "@/component/beach-&-pool-restaurant/beverage-model";
import { createSlice } from "@reduxjs/toolkit";

const initialState: BeverageItems = {
   beverageItems: [],
   fetchAllBeverageItemsStatus: {
     loading: false,
     error: null
   },
   isAddedBeverageItem: false,
   addBeverageItemStatus: {
     loading: false,
     error: null
   },
};

const beverageSlice = createSlice({
  name: "beverage",
  initialState,
  reducers: {
   
  },
  
  extraReducers: (builder) => {
    builder
      // fetch beverage items
      .addCase(fetchAllBeverageItems.pending, (state) => {
        state.fetchAllBeverageItemsStatus.loading = true;
        state.fetchAllBeverageItemsStatus.error = null;
      })
      .addCase(fetchAllBeverageItems.fulfilled, (state, action) => {
        state.fetchAllBeverageItemsStatus.loading = false;
        if (state.beverageItems) {
            state.beverageItems = [];
        }
        state.beverageItems = [...state.beverageItems, ...action.payload];
      })
      .addCase(fetchAllBeverageItems.rejected, (state, action) => {
        state.fetchAllBeverageItemsStatus.loading = false;
        state.fetchAllBeverageItemsStatus.error = action.payload as string;
      })

      // add new beverage item
      .addCase(addNewBeverage.pending, (state) => {
        state.addBeverageItemStatus.loading = true;
        state.addBeverageItemStatus.error = null;
      })

      .addCase(addNewBeverage.fulfilled, (state) => {
        state.isAddedBeverageItem = true;
      })

      .addCase(addNewBeverage.rejected, (state, action) => {
        state.addBeverageItemStatus.loading = true;
        state.addBeverageItemStatus.error = action.payload as string;
      });
  },
  
});

export const { } = beverageSlice.actions;
export default beverageSlice.reducer;
