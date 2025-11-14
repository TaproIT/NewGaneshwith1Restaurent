export interface OrderDetail {
  orderId: string;
  orderNumber: string;
  subTotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  totalBill: number;
  paymentMethod: string;
  serviceType: string;
  restaurantType: string;
  customerType: string;
  orderStatus: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomDetail {
  roomId: string;
  roomNo: string;
  perDayPrice: number;
  switchInDate: string;
  switchOutDate: string;
  nights: number;
  finalRoomTotalPrice: number;
  status: string;
  currency: string;
}

export interface Booking {
  bookingId: string;
  hotel: string;
  guestName: string;
  checkInDateLocal: string;
  checkOutDateLocal: string;
  orderDetails: OrderDetail[];
  roomDetails: RoomDetail[];
  totalRoomsCharges: number;
  totalOrdersBill: number;
  totalBill: number;
}
