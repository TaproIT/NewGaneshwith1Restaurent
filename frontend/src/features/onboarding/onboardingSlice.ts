// src/features/onboarding/onboardingSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Step01FormData, OnboardingState } from "@/types/guestDataTypes";

// ✅ Extracted clean initial data
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
  currentRooms: [], // ✅ from backend shape
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

    addRoom: (state, action: PayloadAction<string>) => {
      if (!state.step01Data.currentRooms.includes(action.payload)) {
        state.step01Data.currentRooms.push(action.payload);
      }
    },

    removeRoom: (state, action: PayloadAction<string>) => {
      state.step01Data.currentRooms = state.step01Data.currentRooms.filter(
        (roomNo) => roomNo !== action.payload
      );
    },

    updatePayload: (
      state,
      action: PayloadAction<{ key: keyof NonNullable<Step01FormData["payload"]>; value: string }>
    ) => {
      if (!state.step01Data.payload) state.step01Data.payload = {};
      state.step01Data.payload[action.payload.key] = action.payload.value;
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
  updatePayload,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
