export interface BeverageCategory {
  _id: string;
  name: string;
  isVisible: boolean;
}

export interface FetchAllBeverageCategoriesStatus{
   error: string | null;
   loading: boolean;
}

export interface FetchAllExtraBeverageCategoriesStatus{
   error: string | null;
   loading: boolean;
}

export interface AddNewExtraBeverageCategoryStatus{
   error: string | null;
   loading: boolean;
}

export interface BeverageCategoryState {
    categories: BeverageCategory[],
    extraCategories: BeverageCategory[],
    fetchAllBeverageCategoriesStatus: FetchAllBeverageCategoriesStatus,
    fetchAllExtraBeverageCategoriesStatus: FetchAllExtraBeverageCategoriesStatus,
    addNewExtraBeverageCategoryStatus: AddNewExtraBeverageCategoryStatus,
    selectedCategory: string | null;
    isBeverageItemList: boolean;
}