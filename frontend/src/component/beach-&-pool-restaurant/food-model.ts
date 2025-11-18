import type { FoodCategory } from "./food-category";

export interface FetchAllFoodItemsStatus {
     loading: boolean,
     error: string | null
}

export interface AddFoodItemStatus {
     loading: boolean,
     error: string | null
}

export interface UpdateFoodItemStatus {
     loading: boolean,
     error: string | null
}

export interface DeleteFoodItemStatus {
     loading: boolean,
     error: string | null
}

export interface FoodItem {
  _id: string;
  itemName: string;
  price: number;
  restaurantType: string;
  isVisible: boolean;
  category: FoodCategory | null;
  isEnableBeverage: boolean;
  liquor?: [{beverage:{id:string,beverageName:string}, amount:number}] | []; // array of Beverage ObjectIds
  fetchAllFoodItemsStatus: FetchAllFoodItemsStatus
}

export interface SelectedFoodItem {
  _id: string;
  itemName: string;
  category: string;
  price: number;
  isEnableBeverage:boolean;
  liquor?: [{ beverage: { id: string; beverageName: string; }; amount: number; }] | []; 
}

export interface FoodItems {
  isAddedNewFoodItem: boolean;
  isUpdatedFoodItem: boolean;
  foodItems: FoodItem[];
  selectedFoodItemId: string | null;
  selectedFoodItem: SelectedFoodItem | null;
  isSelectedFoodItem: boolean;
  isClickAddNewFoodItem: boolean;
  fetchAllFoodItemsStatus: FetchAllFoodItemsStatus;
  addFoodItemStatus: AddFoodItemStatus;
  updateFoodItemStatus: UpdateFoodItemStatus;
  deleteFoodItemStatus: DeleteFoodItemStatus;
}