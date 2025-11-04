import { addNewFoodItem } from "@/api/order/add-food-item-api";
import { fetchAllFoodItems } from "@/api/order/get-food-list-api";
import { updateFoodItem } from "@/api/order/update-food-item-api";
import type { FoodItems } from "@/component/beach-&-pool-restaurant/food-model";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: FoodItems = {
   isAddedNewFoodItem: false,
   isUpdatedFoodItem: false,
   foodItems: [],
   isClickAddNewFoodItem: true,
   selectedFoodItemId: null,
   selectedFoodItem: null,
   isSelectedFoodItem: false,
   fetchAllFoodItemsStatus: {
     loading: false,
     error: null
   },
    addFoodItemStatus: {
     loading: false,
     error: null
   },
   updateFoodItemStatus:{
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
     },
     setIsSelectedFoodItem: (state, action:PayloadAction<boolean>) => {
        state.isSelectedFoodItem = action.payload;
     },
    //  setSelectedFoodItemId: (state, action:PayloadAction<string>) => {
    //     state.selectedFoodItemId = action.payload;
    //  },
     setSelectedFoodItem: (state, action:PayloadAction<string>) => {
       if (action.payload === "") state.selectedFoodItem = null; 

       state.selectedFoodItemId = action.payload;

       const selectedFoodItem = state.foodItems.find((item) => item._id === action.payload);

       if (selectedFoodItem) {
          state.selectedFoodItem = {
            _id: selectedFoodItem._id,
            itemName: selectedFoodItem.itemName,
            category: selectedFoodItem.category?._id ?? "",
            price: selectedFoodItem.price,
            isEnableBeverage: selectedFoodItem.isEnableBeverage,
            liquor: selectedFoodItem.liquor ?? []
          }
       }

       //state.selectedFoodItem = action.payload;
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
      .addCase(addNewFoodItem.pending, (state) => {
        state.isAddedNewFoodItem = false;
        state.addFoodItemStatus.loading = true;
        state.addFoodItemStatus.error = null;
      })

      
      .addCase(addNewFoodItem.fulfilled, (state) => {
          state.addFoodItemStatus.loading = false;
          state.isAddedNewFoodItem = true;
      })

      
      .addCase(addNewFoodItem.rejected, (state, action) => {
        state.addFoodItemStatus.loading = false;
        state.addFoodItemStatus.error = action.payload as string;
      })


      // update new food item
      .addCase(updateFoodItem.pending, (state) => {
        state.isUpdatedFoodItem = false;
        state.addFoodItemStatus.loading = true;
        state.addFoodItemStatus.error = null;
      })

      
      .addCase(updateFoodItem.fulfilled, (state) => {
        state.isUpdatedFoodItem = true;
        state.addFoodItemStatus.loading = false;
        state.addFoodItemStatus.error = null;
      })

      
      .addCase(updateFoodItem.rejected, (state, action) => {
        state.isUpdatedFoodItem = false;
        state.addFoodItemStatus.loading = false;
        state.addFoodItemStatus.error = action.payload as string;
      });
  },
  
});

export const { setIsClickAddNewFoodItem, setIsSelectedFoodItem, setSelectedFoodItem } = foodSlice.actions;
export default foodSlice.reducer;
