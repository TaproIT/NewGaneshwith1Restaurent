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

export interface OrderInitialDataStatus {
   error: string | null;
   loading: boolean;
}

export interface FetchOrderDataStatus {
   error: string | null;
   loading: boolean;
}

export interface Order{
  orderId: string;
  orderNumber: number;
  orderStatus: number;
  customerType: string;       
  serviceType: string;        
  roomNumber: string;         
  guestName: string;          
  tableId: string | null; 
  isOrderTokenOpen: boolean;
  orderTokens: OrderTokenType [];
  newOrderToken: OrderTokenType; 
  subTotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  totalBill: number; 
  orderInitialDataStatus: OrderInitialDataStatus; 
  fetchOrderDataStatus: FetchOrderDataStatus;
}