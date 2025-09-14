export interface OrderFoodItem {
   foodId: string;
   title: string;
   price: number;
   quantity: number;
}

export interface OrderBeverageItem {
   beverageId: string;
   title: string;
   price: number;
   quantity: number;
}

export interface OrderTokenType {
   _id: string;
  tokenId: string;
  tokenNumber: number;
  isPrinted: boolean;
  isHold: boolean;
  foodOrders: OrderFoodItem [],
  beverageOrders: OrderBeverageItem [];
  tokenSubTotal: number;
  tokenTax: number;
  tokenDiscount: number;
  tokenServiceCharge: number;
  tokenTotalBill: number;
}

export interface Table{
   _id: string;
   name: string;
   tableNumber: number;
   isSelected: false;
   status: string;
}

export interface AvailableBookedRoom {
   number: string;
   guest: string;
   roomId: string;
   guestId: string;
   guestName: string;
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

export interface AddNewOrderTokenStatus {
   error: string | null;
   loading: boolean;
}

export interface FetchAvailableBookedRoomsStatus {
   error: string | null;
   loading: boolean;
}

export interface Order{
  _id: string;
  orderNumber: number;
  orderStatus: number;
  customerType: string;       
  serviceType: string; 
  rooms: AvailableBookedRoom[];       
  roomNumber: string;         
  guestName: string;
  guestId: string;          
  tableId: string | null;
  restaurantTable: Table | null; 
  tables: Table[];
  isOrderTokenOpen: boolean;
  orderTokens: OrderTokenType [];
  newOrderToken: OrderTokenType;
  holdOrderToken: OrderTokenType | null;
  isAddNewOrderToken: boolean; 
  subTotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  totalBill: number; 
  orderInitialDataStatus: OrderInitialDataStatus; 
  fetchOrderDataStatus: FetchOrderDataStatus;
  fetchTablesStatus: FetchTablesStatus;
  addTableToOrderStatus: AddTableToOrderStatus;
  addNewOrderTokenStatus: AddNewOrderTokenStatus;
  fetchAvailableBookedRoomsStatus: FetchAvailableBookedRoomsStatus;
}