export interface BeverageCategory {
  _id: string;
  categoryName: string;
  isVisible: boolean;
}

export interface FetchAllBeverageCategoriesStatus{
   error: string | null;
   loading: boolean;
}

export interface BeverageCategoryState {
    categories: BeverageCategory[],
    fetchAllBeverageCategoriesStatus: FetchAllBeverageCategoriesStatus,
    selectedCategory: string | null;
    isBeverageItemList: boolean;
}