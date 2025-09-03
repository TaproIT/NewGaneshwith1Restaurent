import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/user/userSlice'
import onboardingReducer from '../features/onboarding/onboardingSlice'
import invoiceReducer from '../features/invoice/invoiceSlice'
import orderReducer from "../features/beach-restaurant/orderSlice";
import foodReducer from "../features/beach-restaurant/foodSlice";
import bookingReducer from '../features/booking/bookingSlice'
import removedRoomsReducer from '../features/switch-rooms/removedRooms'

export const store = configureStore({
    reducer: {
        user: userReducer,
        onboarding: onboardingReducer,
        invoice: invoiceReducer,
        order: orderReducer,
        food: foodReducer,
        booking: bookingReducer,
        removedRooms: removedRoomsReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;