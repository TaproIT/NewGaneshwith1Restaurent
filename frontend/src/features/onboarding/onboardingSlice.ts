// src/features/onboarding/onboardingSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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
};

interface OnboardingState {
  step: number;
  step01Data: Step01FormData;
}

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
  },
});

export const { nextStep, prevStep, resetSteps, saveStep01Data } =
  onboardingSlice.actions;

export default onboardingSlice.reducer;
