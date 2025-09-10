import type { BeverageCategory } from "./beverage-category-model";

export interface FetchAllBeverageItemsStatus {
     loading: boolean,
     error: string | null
}

export interface BeverageItem {
  _id: string;
  beverageName: string;
  price: number;
  restaurantType: string;
  isVisible: boolean;
  category: string | null;
  //isEnableBeverage: boolean;
  initialStock: number;
  note: string;
}

export interface BeverageItems {
  beverageItems: BeverageItem[];
  fetchAllBeverageItemsStatus: FetchAllBeverageItemsStatus
}