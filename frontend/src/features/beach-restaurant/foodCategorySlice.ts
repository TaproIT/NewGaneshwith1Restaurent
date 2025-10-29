import { addNewFoodCategory } from "@/api/order/add-food-category-api";
import { fetchAllFoodCategories } from "@/api/order/get-food-categories-api";
import type { FoodCategory, FoodCategoryState } from "@/component/beach-&-pool-restaurant/food-category";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



// Initial State
const initialState: FoodCategoryState = {
  isClickedAddFoodCategory: false, 
  isFoodCategory: true,
  categories: [],
  selectedCategoryId: null,
  fetchAllFoodCategoriesStatus: {
     loading: false,
     error: null
  },
  addFoodCategoryStatus: {
    loading: false,
    error: null,
  }
};


// Slice
const foodCategorySlice = createSlice({
    name: "foodCategory",
    initialState,
    reducers: {
        setIsClickedAddFoodCategory: (state, action: PayloadAction<boolean>) => {
            state.isClickedAddFoodCategory = action.payload;
        },
        setSelectedCategoryId: (state, action: PayloadAction<string>) => {
            state.selectedCategoryId = action.payload;
        },
        setCategories: (state, action: PayloadAction<FoodCategory[]>) => {
            state.categories = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch
            .addCase(fetchAllFoodCategories.pending, (state) => {
                state.fetchAllFoodCategoriesStatus.loading = true;
                state.fetchAllFoodCategoriesStatus.error = null;
            })
            .addCase(fetchAllFoodCategories.fulfilled, (state, action) => {
                state.fetchAllFoodCategoriesStatus.loading = false;
                if (state.categories) {
                    state.categories = [];
                }
                state.categories = [...state.categories, ...action.payload];
                state.selectedCategoryId = state.categories[0]._id;
            })
            .addCase(fetchAllFoodCategories.rejected, (state, action) => {
                state.fetchAllFoodCategoriesStatus.loading = false;
                state.fetchAllFoodCategoriesStatus.error = action.payload as string;
            })

            // add food category
            .addCase(addNewFoodCategory.pending, (state) => {
                state.addFoodCategoryStatus = {
                    loading: true,
                    error: null,
                };
            })
            .addCase(addNewFoodCategory.fulfilled, (state) => {
                state.addFoodCategoryStatus = {
                    loading: false,
                    error: null,
                };
            })
            .addCase(addNewFoodCategory.rejected, (state, action) => {
                state.addFoodCategoryStatus = {
                    loading: false,
                    error: action.payload as string,
                };
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

export const { setSelectedCategoryId, setIsClickedAddFoodCategory } = foodCategorySlice.actions;
export default foodCategorySlice.reducer;
