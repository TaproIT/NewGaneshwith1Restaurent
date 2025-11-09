import type { deleteExtraBeverageItem } from "@/api/order/delete-extra-beverage-api"

export interface FetchAllBeverageItemsStatus {
     loading: boolean,
     error: string | null
}

export interface FetchAllExtraBeverageItemsStatus {
     loading: boolean,
     error: string | null
}

export interface AddBeverageItemStatus {
     loading: boolean,
     error: string | null
}

export interface AddExtraBeverageItemStatus {
     loading: boolean,
     error: string | null
}

export interface UpdateExtraBeverageItemStatus {
     loading: boolean,
     error: string | null
}

export interface DeleteExtraBeverageItemStatus {
     loading: boolean,
     error: string | null
}

export interface UpdateExtraBeverageCategoryStatus {
     loading: boolean,
     error: string | null
}

export interface DeleteExtraBeverageCategoryStatus {
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
  extraBeverageCategory?: {
    _id: string;
    name: string;
  }
  isEnableBeverage: boolean;
  liquor?: [{beverage:string, amount:number}] | []; 
  initialStock: number;
  note: string;
}

export interface ExtraBeverageItem {
  _id: string;
  beverageName: string;
  price: number;
  restaurantType: string;
  isVisible: boolean;
  category: string | null;
  extraBeverageCategory?: {
    _id: string;
    name: string;
  }
  isEnableBeverage: boolean;
  liquor?: [{beverage:string, amount:number}] | []; 
  initialStock: number;
  note: string;
}


export interface SelectedBeverageItem {
  _id: string;
  beverageName: string;
  category: string;
  price: number;
}

export interface SelectedExtraBeverageItem {
  _id: string;
  beverageName: string;
  category: string;
  price: number;
  isEnableBeverage:boolean;
  liquor?: [{beverage:string, amount:number}] | []; 
}

export interface BeverageItems {
  beverageItems: BeverageItem[];
  extrabeverageItems: ExtraBeverageItem[];
  selectedBeverageItemId: string | null;
  selectedBeverageItem: SelectedBeverageItem | null;
  isSelectedBeverageItem: boolean;
  selectedExtraBeverageItemId: string | null;
  selectedExtraBeverageItem: SelectedExtraBeverageItem | null;
  isSelectedExtraBeverageItem: boolean;
  fetchAllBeverageItemsStatus: FetchAllBeverageItemsStatus;
  fetchAllExtraBeverageItemsStatus: FetchAllExtraBeverageItemsStatus;
  isAddedBeverageItem: boolean;
  addBeverageItemStatus: AddBeverageItemStatus;
  addExtraBeverageItemStatus: AddExtraBeverageItemStatus;
  updateExtraBeverageItemStatus: UpdateExtraBeverageItemStatus;
  deleteExtraBeverageItemStatus: DeleteExtraBeverageItemStatus;
  updateExtraBeverageCategoryStatus: UpdateExtraBeverageCategoryStatus;
  deleteExtraBeverageCategoryStatus: DeleteExtraBeverageCategoryStatus;
}