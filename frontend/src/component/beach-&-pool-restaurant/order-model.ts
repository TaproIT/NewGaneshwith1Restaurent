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

export interface Table{
   _id: string;
   name: string;
   tableNumber: number;
   isSelected: false;
   status: string;
}

export type TableStatus = "Selected" | "Empty" | "Reserved";

export interface OrderInitialDataStatus {
   error: string | null;
   loading: boolean;
}

export interface FetchOrderDataStatus {
   error: string | null;
   loading: boolean;
}

export interface FetchTablesStatus {
   error: string | null;
   loading: boolean;
}

export interface AddTableToOrderStatus {
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
  restaurantTable: Table | null; 
  tables: Table[];
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
  fetchTablesStatus: FetchTablesStatus;
  addTableToOrderStatus: AddTableToOrderStatus;
}