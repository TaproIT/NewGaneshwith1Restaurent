export interface FoodCategory {
  _id: string;
  categoryName: string;
  isVisible: boolean;
}

export interface FetchAllFoodCategoriesStatus{
   error: string | null;
   loading: boolean;
}

export interface AddFoodCategoryStatus{
   error: string | null;
   loading: boolean;
}

export interface UpdateFoodCategoryStatus{
   error: string | null;
   loading: boolean;
}

export interface FoodCategoryState {
    isClickedAddFoodCategory:boolean,
    isFoodCategory: boolean,
    categories: FoodCategory[],
    fetchAllFoodCategoriesStatus: FetchAllFoodCategoriesStatus,
    addFoodCategoryStatus: AddFoodCategoryStatus,
    selectedCategoryId: string | null;
    selectedFoodCategoryTitle: string | null;
    isClickedUpdateFoodCategory:boolean,
    updateFoodCategoryStatus: UpdateFoodCategoryStatus
}