export interface OrderFoodItem {
   foodId: string;
   title: string;
   price: number;
   quantity: number;
}

export interface OrderBeverageItem {
   foodId: string;
   title: string;
   price: number;
   quantity: number;
}

export interface OrderTokenType {
  tokenId: string;
  tokenNumber: number;
  isPrinted: boolean;
  isHold: boolean;
  foodItems: OrderFoodItem [],
  beverageItems: OrderBeverageItem [];
}