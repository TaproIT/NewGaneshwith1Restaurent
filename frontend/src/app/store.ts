import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/user/userSlice'
import onboardingReducer from '../features/onboarding/onboardingSlice'

export const store = configureStore({
    reducer: {
        user: userReducer,
        onboarding: onboardingReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;