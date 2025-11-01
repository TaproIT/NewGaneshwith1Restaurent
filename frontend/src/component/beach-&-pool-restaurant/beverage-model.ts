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
  //isEnableBeverage: boolean;
  initialStock: number;
  note: string;
}

export interface BeverageItems {
  beverageItems: BeverageItem[];
  extrabeverageItems: BeverageItem[];
  fetchAllBeverageItemsStatus: FetchAllBeverageItemsStatus;
  fetchAllExtraBeverageItemsStatus: FetchAllExtraBeverageItemsStatus;
  isAddedBeverageItem: boolean;
  addBeverageItemStatus: AddBeverageItemStatus;
  addExtraBeverageItemStatus: AddExtraBeverageItemStatus;
}