export interface CompletedRoom {
  currency: string;
  roomId: string;
  roomNo: string;
  price: number;
  isActive: boolean;
  _id: string;
}

export interface RoomsHistory {
  currency: string;
  roomId: string;
  roomNo: string;
  perDayPrice: number;
  night: number;
  finalRoomTotalPrice: number;
  switchOutDate: string;
  switchInDate: string;
  isSwitched: boolean;
  status: string;
  _id: string;
  perDayPriceHistory: any[];
}

export interface UpdateHistory {
  updateUserId: string;
  updatedByName: string;
  updateDate: string;
}

export interface CompletedBooking {
  miniBar: number;
  laundary: number;
  spa: number;
  _id: string;
  hotel: string;
  guestName: string;
  country: string;
  email: string;
  whatsapp: string;
  createdById: string;
  createdByName: string;
  passportId: string;
  totalGuests: number;
  kids: number;
  adults: number;
  lengthOfStay: number;
  oldLengthOfStay: number;
  checkIn: string;
  checkOut: string;
  currentRooms: CompletedRoom[];
  totalAdditionalPrice: number;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalBill: number;
  customerType: string;
  breakfast: string;
  payload: {
    extraService: string;
    specialRequests: string;
  };
  qrPublicId: string;
  qrUrl: string;
  bookingDate: string;
  isCheckOut: boolean;
  oldCheckOutDateStatus: boolean;
  roomsHistory: RoomsHistory[];
  additionalPriceItems: any[];
  updatesHistory: UpdateHistory[];
  orders: any[];
  uniqueBookingId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  finalAllRoomsTotalPrice: number;
  totalOrdersBill: number;
  checkOutById: string;
  checkOutByName: string;
  oldCheckOutDate: string;
  paymentMethod: string;
}
