import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/user/userSlice'
import onboardingReducer from '../features/onboarding/onboardingSlice'
import invoiceReducer from '../features/invoice/invoiceSlice'
import bookingReducer from '../features/booking/bookingSlice'
import removedRoomsReducer from '../features/switch-rooms/removedRooms'

export const store = configureStore({
    reducer: {
        user: userReducer,
        onboarding: onboardingReducer,
        invoice: invoiceReducer,
        booking: bookingReducer,
        removedRooms: removedRoomsReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;