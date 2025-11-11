import type { SupportedCurrency } from "./currency";

export type BookedRoom = {
  roomNo: string;
  price: number;
  currency: SupportedCurrency;
  totalPrice:number
};

export type Step01FormData = {
  hotel: string;
  guestName: string;
  email: string;
  whatsapp: string;
  passportId: string;   // ✅ match backend field name (camelCase "Id")
  country: string;
  adults: number;
  kids: number;
  checkIn: string;      // ISO string date from backend
  checkOut: string;     // ISO string date from backend
  lengthOfStay: number;
  totalGuests: number;
  currentRooms: BookedRoom[]; // ✅ matches ["103"] from backend
  payload?: {
    extraService?: string;
    specialRequests?: string;
  };
  bookingDate: string;  // ✅ ISO string from backend
  customerType: string;
  breakfast: string;
};

export interface OnboardingState {
  step: number;
  step01Data: Step01FormData;
}