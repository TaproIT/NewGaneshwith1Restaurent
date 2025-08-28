// src/features/onboarding/onboardingSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BookedRoom, Step01FormData, OnboardingState } from "@/types/guestDataTypes";

const initialState: OnboardingState = {
  step: 1,
  step01Data: {
    hotel: "",
    guestName: "",
    email: "",
    whatsapp: "",
    passportID: "",
    country: "",
    adults: 0,
    kids: 0,
    checkIn: "",
    checkOut: "",
    lengthOfStay: 0,
    totalGuests: 0,
    bookedRooms: [], // now inside step01Data
  },
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
      state.step01Data = action.payload;
    },
    saveBookedRoom: (state, action: PayloadAction<BookedRoom>) => {
      state.step01Data.bookedRooms.push(action.payload); // ✅ correct place
    },
  },
});

export const { 
  nextStep, 
  prevStep, 
  resetSteps, 
  saveStep01Data,
  saveBookedRoom,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
