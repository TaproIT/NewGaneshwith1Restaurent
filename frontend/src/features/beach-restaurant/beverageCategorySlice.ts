import { fetchAllBeverageCategories } from "@/api/order/get-beverage-categories-api";
import type { BeverageCategory, BeverageCategoryState } from "@/component/beach-&-pool-restaurant/beverage-category-model";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



// Initial State
const initialState: BeverageCategoryState = {
  categories: [],
  selectedCategoryId: null,
  fetchAllBeverageCategoriesStatus: {
     loading: false,
     error: null
  },
  isBeverageItemList: false
};


// Slice
const beverageCategorySlice = createSlice({
    name: "beverageCategory",
    initialState,
    reducers: {
        setCategoryId: (state, action: PayloadAction<string>) => {
            state.selectedCategoryId = action.payload;
        },
        setCategories: (state, action: PayloadAction<BeverageCategory[]>) => {
            state.categories = action.payload;
        },
        setIsBeverageItemsList: (state, action: PayloadAction<boolean>) => {
            state.isBeverageItemList = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetch
            .addCase(fetchAllBeverageCategories.pending, (state) => {
                state.fetchAllBeverageCategoriesStatus.loading = true;
                state.fetchAllBeverageCategoriesStatus.error = null;
            })
            .addCase(fetchAllBeverageCategories.fulfilled, (state, action) => {
                state.fetchAllBeverageCategoriesStatus.loading = false;
                if (state.categories) {
                    state.categories = [];
                }
                state.categories = [...state.categories, ...action.payload];
            })
            .addCase(fetchAllBeverageCategories.rejected, (state, action) => {
                state.fetchAllBeverageCategoriesStatus.loading = false;
                state.fetchAllBeverageCategoriesStatus.error = action.payload as string;
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

export const { setCategoryId, setIsBeverageItemsList } = beverageCategorySlice.actions;
export default beverageCategorySlice.reducer;
