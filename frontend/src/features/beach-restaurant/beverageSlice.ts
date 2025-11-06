import { addNewBeverage } from "@/api/order/add-beverage-api";
import { addNewExtraBeverage } from "@/api/order/add-extra-beverage-api";
import { deleteExtraBeverageItem } from "@/api/order/delete-extra-beverage-api";
import { fetchAllBeverageItems } from "@/api/order/get-beverage-list-api";
import { fetchAllExtraBeverageItems } from "@/api/order/get-extra-beverage-list-api";
import { updateExtraBeverage } from "@/api/order/update-extra-beverage-item-api";
import type { BeverageItems } from "@/component/beach-&-pool-restaurant/beverage-model";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: BeverageItems = {
   beverageItems: [],
   extrabeverageItems: [],
   selectedBeverageItemId: null,
   selectedBeverageItem: null,
   isSelectedBeverageItem: false,
   selectedExtraBeverageItemId: null,
   selectedExtraBeverageItem: null,
   isSelectedExtraBeverageItem: false,
   fetchAllBeverageItemsStatus: {
     loading: false,
     error: null
   },
  fetchAllExtraBeverageItemsStatus: {
    loading: false,
    error: null
  },
  isAddedBeverageItem: false,
  addBeverageItemStatus: {
    loading: false,
    error: null
  },
  addExtraBeverageItemStatus: {
    loading: false,
    error: null
  },
  updateExtraBeverageItemStatus: {
    loading: false,
    error: null
  },
  deleteExtraBeverageItemStatus: {
    loading: false,
    error: null
  },
};

const beverageSlice = createSlice({
  name: "beverage",
  initialState,
  reducers: {
    setIsSelectedBeverageItem: (state, action:PayloadAction<boolean>) => {
        state.isSelectedBeverageItem = action.payload;
    },

    setSelectedBeverageItem: (state, action: PayloadAction<string>) => {
      if (action.payload === "") state.selectedBeverageItem = null;

      state.selectedBeverageItemId = action.payload;

      const item = state.beverageItems.find((item) => item._id === action.payload);

      if (item) {
        state.selectedBeverageItem = {
          _id: item._id,
          beverageName: item.beverageName,
          category: item.category ?? "",
          price: item.price
        }
      }

      //state.selectedFoodItem = action.payload;
    },

    setIsSelectedExtraBeverageItem: (state, action:PayloadAction<boolean>) => {
        state.isSelectedExtraBeverageItem = action.payload;
    },

    setSelectedExtraBeverageItem: (state, action: PayloadAction<string>) => {
      if (action.payload === "") state.selectedExtraBeverageItem = null;

      state.selectedExtraBeverageItemId = action.payload;

      const item = state.extrabeverageItems.find((item) => item._id === action.payload);

      if (item) {
        state.selectedExtraBeverageItem = {
          _id: item._id,
          beverageName: item.beverageName,
          category: item.category ?? "",
          price: item.price,
          isEnableBeverage: item.isEnableBeverage,
          liquor: item.liquor ?? []
        }
      }

      //state.selectedFoodItem = action.payload;
    },

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
        state.isAddedBeverageItem = false;
      })
      .addCase(fetchAllBeverageItems.rejected, (state, action) => {
        state.fetchAllBeverageItemsStatus.loading = false;
        state.fetchAllBeverageItemsStatus.error = action.payload as string;
      })


      .addCase(fetchAllExtraBeverageItems.pending, (state) => {
        state.fetchAllExtraBeverageItemsStatus.loading = true;
        state.fetchAllExtraBeverageItemsStatus.error = null;
      })
      .addCase(fetchAllExtraBeverageItems.fulfilled, (state, action) => {
        state.fetchAllExtraBeverageItemsStatus.loading = false;
        if (state.extrabeverageItems) {
          state.extrabeverageItems = [];
        }
        state.extrabeverageItems = [...state.extrabeverageItems, ...action.payload];
        state.isAddedBeverageItem = false;
      })
      .addCase(fetchAllExtraBeverageItems.rejected, (state, action) => {
        state.fetchAllExtraBeverageItemsStatus.loading = false;
        state.fetchAllExtraBeverageItemsStatus.error = action.payload as string;
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
      })


      // add new extra beverage item
      .addCase(addNewExtraBeverage.pending, (state) => {
        state.addExtraBeverageItemStatus.loading = true;
        state.addExtraBeverageItemStatus.error = null;
      })

      .addCase(addNewExtraBeverage.fulfilled, (state) => {
        state.isAddedBeverageItem = true;
        state.addExtraBeverageItemStatus.loading = false;
        state.addExtraBeverageItemStatus.error = null;
      })

      .addCase(addNewExtraBeverage.rejected, (state, action) => {
        state.addExtraBeverageItemStatus.loading = true;
        state.addExtraBeverageItemStatus.error = action.payload as string;
      })


      // update extra beverage item
      .addCase(updateExtraBeverage.pending, (state) => {
        state.updateExtraBeverageItemStatus.loading = true;
        state.updateExtraBeverageItemStatus.error = null;
      })

      .addCase(updateExtraBeverage.fulfilled, (state) => {
        state.isAddedBeverageItem = true;
        state.updateExtraBeverageItemStatus.loading = false;
        state.updateExtraBeverageItemStatus.error = null;
      })

      .addCase(updateExtraBeverage.rejected, (state, action) => {
        state.updateExtraBeverageItemStatus.loading = true;
        state.updateExtraBeverageItemStatus.error = action.payload as string;
      })


      // delete extra beverage item
      .addCase(deleteExtraBeverageItem.pending, (state) => {
        state.deleteExtraBeverageItemStatus.loading = true;
        state.deleteExtraBeverageItemStatus.error = null;
      })

      .addCase(deleteExtraBeverageItem.fulfilled, (state) => {
        state.isAddedBeverageItem = true;
        state.deleteExtraBeverageItemStatus.loading = false;
        state.deleteExtraBeverageItemStatus.error = null;
      })

      .addCase(deleteExtraBeverageItem.rejected, (state, action) => {
        state.deleteExtraBeverageItemStatus.loading = true;
        state.deleteExtraBeverageItemStatus.error = action.payload as string;
      });
  },
  
});

export const { setIsSelectedBeverageItem, setSelectedBeverageItem, setIsSelectedExtraBeverageItem, setSelectedExtraBeverageItem } = beverageSlice.actions;
export default beverageSlice.reducer;
