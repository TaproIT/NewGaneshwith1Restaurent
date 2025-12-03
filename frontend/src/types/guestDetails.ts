// types/bookingTypes.ts
export interface Booking {
  bookingId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  activeRooms: ActiveRoom[];
}

export interface ActiveRoom {
  roomNo: string;
  type: string;
  facilities: string[];
  perDayPrice: number;
  switchInDate: string;
  switchOutDate: string;
  roomTotalPrice: number;
  currency: string
}
