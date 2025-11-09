import { addNewFoodCategory } from "@/api/order/add-food-category-api";
import { deleteFoodCategory } from "@/api/order/delete-food-category-api";
import { fetchAllFoodCategories } from "@/api/order/get-food-categories-api";
import { updateFoodCategory } from "@/api/order/update-food-category-api";
import type { FoodCategory, FoodCategoryState } from "@/component/beach-&-pool-restaurant/food-category";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



// Initial State
const initialState: FoodCategoryState = {
    isClickedAddFoodCategory: false,
    isFoodCategory: true,
    categories: [],
    selectedCategoryId: null,
    selectedFoodCategoryTitle: null,
    isClickedUpdateFoodCategory: false,
    fetchAllFoodCategoriesStatus: {
        loading: false,
        error: null
    },
    addFoodCategoryStatus: {
        loading: false,
        error: null,
    },
    updateFoodCategoryStatus: {
        loading: false,
        error: null,
    },
    deleteFoodCategoryStatus: {
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
        setIsFoodCategory: (state, action: PayloadAction<boolean>) => {
            state.isFoodCategory = action.payload;
        },
        setSelectedCategoryId: (state, action: PayloadAction<string>) => {
            state.selectedCategoryId = action.payload;
        },
        setSelectedFoodCategoryTitle: (state, action: PayloadAction<string>) => {
           if (action.payload === "" ) {
              state.selectedFoodCategoryTitle = null;
           } 
           const selectedCategory = state.categories.find((cat) => cat._id === action.payload)
           if (selectedCategory){
            state.selectedFoodCategoryTitle = selectedCategory?.categoryName;
           }
        },
        setCategories: (state, action: PayloadAction<FoodCategory[]>) => {
            state.categories = action.payload;
        },
        setIsClickedUpdateFoodCategory: (state, action: PayloadAction<boolean>) => {
            state.isClickedUpdateFoodCategory = action.payload;
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
            
            // update a food category
            .addCase(updateFoodCategory.pending, (state) => {
                state.updateFoodCategoryStatus = {
                    loading: true,
                    error: null,
                };
            })
            .addCase(updateFoodCategory.fulfilled, (state) => {
                state.updateFoodCategoryStatus = {
                    loading: false,
                    error: null,
                };
            })
            .addCase(updateFoodCategory.rejected, (state, action) => {
                state.updateFoodCategoryStatus = {
                    loading: false,
                    error: action.payload as string,
                };
            })


             // delete a food category
            .addCase(deleteFoodCategory.pending, (state) => {
                state.deleteFoodCategoryStatus = {
                    loading: true,
                    error: null,
                };
            })
            .addCase(deleteFoodCategory.fulfilled, (state) => {
                state.deleteFoodCategoryStatus = {
                    loading: false,
                    error: null,
                };
            })
            .addCase(deleteFoodCategory.rejected, (state, action) => {
                state.deleteFoodCategoryStatus = {
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

export const { setSelectedCategoryId, setIsClickedAddFoodCategory, setIsFoodCategory, setSelectedFoodCategoryTitle, setIsClickedUpdateFoodCategory } = foodCategorySlice.actions;
export default foodCategorySlice.reducer;
