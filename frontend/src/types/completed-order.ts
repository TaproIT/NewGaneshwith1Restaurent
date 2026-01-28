export interface CompletedOrderItem {
  title: string;
  quantity: number;
  price: number;
}

export interface CompletedOrderToken {
  _id: string;
  foodOrders: CompletedOrderItem[];
  beverageOrders: CompletedOrderItem[];
}

export interface CompletedOrder {
  _id: string;
  orderNumber: string;
  roomNumber: string;
  guestName: string;
  customerType: string;
  serviceType: string;
  restaurantType: string;
  subTotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  totalBill: number;
  paymentMethod: string;
  createdAt: string;
  orderTokens: CompletedOrderToken[];
}
