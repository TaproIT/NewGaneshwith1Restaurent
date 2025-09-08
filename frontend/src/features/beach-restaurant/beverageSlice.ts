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

    //   // add
    //   .addCase(addCategory.fulfilled, (state, action: PayloadAction<FoodCategory>) => {
    //     state.categories.push(action.payload);
    //   })

    //   // update
    //   .addCase(updateCategory.fulfilled, (state, action: PayloadAction<FoodCategory>) => {
    //     const index = state.categories.findIndex((c) => c._id === action.payload._id);
    //     if (index !== -1) {
    //       state.categories[index] = action.payload;
    //     }
    //   })

    //   // delete
    //   .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
    //     state.categories = state.categories.filter((c) => c._id !== action.payload);
    //   });
  },
  
});

export const { } = beverageSlice.actions;
export default beverageSlice.reducer;
