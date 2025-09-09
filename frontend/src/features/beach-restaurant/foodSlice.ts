import { fetchAllFoodItems } from "@/api/order/get-food-list-api";
import type { FoodItems } from "@/component/beach-&-pool-restaurant/food-model";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: FoodItems = {
   foodItems: [],
   isClickAddNewFoodItem:false,
   fetchAllFoodItemsStatus: {
     loading: false,
     error: null
   }
};

const foodSlice = createSlice({
  name: "food",
  initialState,
  reducers: {
     setIsClickAddNewFoodItem: (state, action:PayloadAction<boolean>) => {
        state.isClickAddNewFoodItem = action.payload;
     }
  },
  
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAllFoodItems.pending, (state) => {
        state.fetchAllFoodItemsStatus.loading = true;
        state.fetchAllFoodItemsStatus.error = null;
      })
      .addCase(fetchAllFoodItems.fulfilled, (state, action) => {
        state.fetchAllFoodItemsStatus.loading = false;
        if (state.foodItems) {
            state.foodItems = [];
        }
        state.foodItems = [...state.foodItems, ...action.payload];
      })
      .addCase(fetchAllFoodItems.rejected, (state, action) => {
        state.fetchAllFoodItemsStatus.loading = false;
        state.fetchAllFoodItemsStatus.error = action.payload as string;
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

export const { setIsClickAddNewFoodItem } = foodSlice.actions;
export default foodSlice.reducer;
