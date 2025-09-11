import { addNewFoodItem } from "@/api/order/add-food-item-api";
import { fetchAllFoodItems } from "@/api/order/get-food-list-api";
import type { FoodItems } from "@/component/beach-&-pool-restaurant/food-model";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: FoodItems = {
   isAddedNewFoodItem: false,
   foodItems: [],
   isClickAddNewFoodItem:false,
   fetchAllFoodItemsStatus: {
     loading: false,
     error: null
   },
    addFoodItemStatus: {
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

      // add new food item
      .addCase(addNewFoodItem.pending, (state, action) => {
        state.addFoodItemStatus.loading = true;
        state.addFoodItemStatus.error = null;
      })

      
      .addCase(addNewFoodItem.fulfilled, (state, action) => {
          state.addFoodItemStatus.loading = false;
          state.isAddedNewFoodItem = true;
      })

      
      .addCase(addNewFoodItem.rejected, (state, action) => {
        state.addFoodItemStatus.loading = false;
        state.addFoodItemStatus.error = action.payload as string;
      });
  },
  
});

export const { setIsClickAddNewFoodItem } = foodSlice.actions;
export default foodSlice.reducer;
