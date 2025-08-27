import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/user/userSlice'
import onboardingReducer from '../features/onboarding/onboardingSlice'
import roomsReducer from '../features/rooms/roomsSlice'
import invoiceReducer from '../features/invoice/invoiceSlice'
import orderReducer from "../features/beach-restaurant/orderSlice";
import foodReducer from "../features/beach-restaurant/foodSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        onboarding: onboardingReducer,
        rooms: roomsReducer,
        invoice: invoiceReducer,
        order: orderReducer,
        food: foodReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;