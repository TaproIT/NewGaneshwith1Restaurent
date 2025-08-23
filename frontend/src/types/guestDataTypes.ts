export type BookedRoom = {
  id: number;
  price: number;
};

export type Step01FormData = {
  hotel: string;
  guestName: string;
  email: string;
  whatsapp: string;
  passportID: string;
  country: string;
  adults: number;
  kids: number;
  checkIn: string;
  checkOut: string;
  lengthOfStay: number;
  totalGuests: number;
  bookedRooms: BookedRoom[];
};

export interface OnboardingState {
  step: number;
  step01Data: Step01FormData;
}