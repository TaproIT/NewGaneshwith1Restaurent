export interface RoomPriceHistory {
  price: number;
  currency: string;
  date: string;
  _id: string;
}

export interface RoomHistory {
  roomId: {
    _id: string;
    no: string;
    perDayPrice: number;
  };
  roomNo: string;
  perDayPrice: number;
  currency: string;
  night?: number;
  finalRoomTotalPrice?: number | null;
  discountPrice?: number | null;
  switchOutDate: string;
  switchInDate: string;
  isSwitched: boolean;
  switchFrom?: string;
  status: string;
  _id: string;
  perDayPriceHistory: RoomPriceHistory[];
}

export interface CurrentRoom {
  roomId: {
    _id: string;
    no: string;
    perDayPrice: number;
    facilities?: string[];
    isBooked?: boolean;
  };
  roomNo: string;
  price?: number;
  currency: string;
  isActive: boolean;
  _id: string;
}

export interface AdditionalPriceItem {
  title: string;
  price: number;
  currency: string;
  _id: string;
}

export interface PayloadData {
  extraService?: string;
  specialRequests?: string;
}

export interface Booking {
  _id: string;
  hotel: string;
  guestName: string;
  country: string;
  email: string;
  whatsapp: string;
  createdById: string;
  createdByName: string;
  passportId: string;
  adults: number;
  kids: number;
  totalGuests: number;
  lengthOfStay: number;
  oldLengthOfStay: number;
  checkIn: string;
  checkOut: string;
  currentRooms: CurrentRoom[];
  roomsHistory: RoomHistory[];
  totalAdditionalPrice: number;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalBill: number;
  customerType: string;
  breakfast: string;
  payload?: PayloadData;
  qrPublicId: string;
  qrUrl: string;
  bookingDate: string;
  isCheckOut: boolean;
  oldCheckOutDateStatus: boolean;
  additionalPriceItems: AdditionalPriceItem[];
  updatesHistory: any[];
  orders: any[]; // If you want, I can define Order type too
  uniqueBookingId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
