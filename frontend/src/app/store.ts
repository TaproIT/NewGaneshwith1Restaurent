import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/user/userSlice'
import onboardingReducer from '../features/onboarding/onboardingSlice'
import roomsReducer from '../features/rooms/roomsSlice'
import invoiceReducer from '../features/invoice/invoiceSlice'
import bookingReducer from '../features/booking/bookingSlice'

export const store = configureStore({
    reducer: {
        user: userReducer,
        onboarding: onboardingReducer,
        rooms: roomsReducer,
        invoice: invoiceReducer,
        booking: bookingReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;