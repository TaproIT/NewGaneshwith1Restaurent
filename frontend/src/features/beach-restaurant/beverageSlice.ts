import { addNewBeverage } from "@/api/order/add-beverage-api";
import { fetchAllBeverageItems } from "@/api/order/get-beverage-list-api";
import type { BeverageItems } from "@/component/beach-&-pool-restaurant/beverage-model";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: BeverageItems = {
   beverageItems: [],
   fetchAllBeverageItemsStatus: {
     loading: false,
     error: null
   }
};

const beverageSlice = createSlice({
  name: "beverage",
  initialState,
  reducers: {
   
  },
  
  extraReducers: (builder) => {
    builder
      // fetch
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

      // add
      .addCase(addNewBeverage.pending, (state, action) => {
        //state.beverageItems.push(action.payload);
      })

      // update
      .addCase(addNewBeverage.fulfilled, (state, action) => {
       
      })

      // delete
      .addCase(addNewBeverage.rejected, (state, action) => {
        
      });
  },
  
});

export const { } = beverageSlice.actions;
export default beverageSlice.reducer;
