export interface FoodCategory {
  _id: string;
  categoryName: string;
  isVisible: boolean;
}

export interface FetchAllFoodCategoriesStatus{
   error: string | null;
   loading: boolean;
}

export interface FoodCategoryState {
    categories: FoodCategory[],
    fetchAllFoodCategoriesStatus: FetchAllFoodCategoriesStatus,
    selectedCategoryId: string | null;
}