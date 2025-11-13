// src/features/onboarding/onboardingSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Step01FormData,
  OnboardingState,
  BookedRoom,
} from "@/types/guestDataTypes";

// ✅ Updated initial data structure
const initialStep01Data: Step01FormData = {
  hotel: "",
  guestName: "",
  email: "",
  whatsapp: "",
  passportId: "",
  country: "",
  adults: 0,
  kids: 0,
  checkIn: "",
  checkOut: "",
  lengthOfStay: 0,
  totalGuests: 0,

  currentRooms: [], // now array of { roomNo, price, currency }

  payload: {
    extraService: "",
    specialRequests: "",
  },

  bookingDate: "",
  customerType: "",
  breakfast: "",
};

const initialState: OnboardingState = {
  step: 1,
  step01Data: initialStep01Data,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    nextStep: (state) => {
      state.step += 1;
    },

    prevStep: (state) => {
      if (state.step > 1) state.step -= 1;
    },

    resetSteps: () => initialState,

    saveStep01Data: (state, action: PayloadAction<Step01FormData>) => {
      state.step01Data = { ...action.payload };
    },

    // ✅ addRoom now accepts object { roomNo, price, currency }
    addRoom: (state, action: PayloadAction<BookedRoom>) => {
      const exists = state.step01Data.currentRooms.some(
        (room) => room.roomNo === action.payload.roomNo
      );
      if (!exists) {
        state.step01Data.currentRooms.push(action.payload);
      }
    },

    removeRoom: (state, action: PayloadAction<string>) => {
      state.step01Data.currentRooms = state.step01Data.currentRooms.filter(
        (room) => room.roomNo !== action.payload
      );
    },

    // onboardingSlice.ts
    updateRoom(state, action) {
      const { roomNo, price, currency } = action.payload;
      const room = state.step01Data.currentRooms.find(
        (r) => r.roomNo === roomNo
      );
      if (room) {
        room.price = price;
        room.currency = currency;
      }
    },
  },
});

export const {
  nextStep,
  prevStep,
  resetSteps,
  saveStep01Data,
  addRoom,
  removeRoom,
  updateRoom,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
