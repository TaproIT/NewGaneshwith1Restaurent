// store/foodSlice.ts
import type { Category, FoodItem } from "@/component/beach-&-pool-restaurant/food-model";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FoodState {
  categories: Category[];
  selectedCategoryId: string | null;
  foods: FoodItem[];
}

const initialState: FoodState = {
  categories: [
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
    { id: "drinks", label: "Drinks" },
    { id: "dessert", label: "Dessert" },
    { id: "dessert2", label: "Dessert2" },
  ],
  selectedCategoryId: null, 
   foods: [
    { id: "f1", categoryId: "breakfast", title: "Pancakes", price: 450 },
    { id: "f2", categoryId: "breakfast", title: "Omelette", price: 400 },
    { id: "f3", categoryId: "lunch", title: "Fried Rice", price: 800 },
    { id: "f4", categoryId: "lunch", title: "Chicken Curry", price: 950 },
    { id: "f5", categoryId: "dinner", title: "Grilled Fish", price: 1200 },
    { id: "f6", categoryId: "dinner", title: "Steak", price: 1500 },
    { id: "f7", categoryId: "drinks", title: "Orange Juice", price: 300 },
    { id: "f8", categoryId: "drinks", title: "Coffee", price: 350 },
    { id: "f9", categoryId: "dessert", title: "Ice Cream", price: 400 },
    { id: "f10", categoryId: "dessert2", title: "Cake Slice", price: 500 },
  ],
};

const foodSlice = createSlice({
  name: "food",
  initialState,
  reducers: {
    setCategoryId: (state, action: PayloadAction<string>) => {
      state.selectedCategoryId = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
  },
});

export const { setCategoryId, setCategories } = foodSlice.actions;
export default foodSlice.reducer;
