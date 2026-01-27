import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/user/userSlice'
import onboardingReducer from '../features/onboarding/onboardingSlice'
import invoiceReducer from '../features/invoice/invoiceSlice'
import orderReducer from "../features/beach-restaurant/orderSlice";
import foodReducer from "../features/beach-restaurant/foodSlice";
import bookingReducer from '../features/booking/bookingSlice';
import removedRoomsReducer from '../features/switch-rooms/removedRooms';
import foodCategoryReducer from "../features/beach-restaurant/foodCategorySlice";
import holdOrderReducer from "../features/beach-restaurant/holdOrderSlice";
import dailyOrderSummaryReducer from "../features/beach-restaurant/dailySummarySlice";
import beverageCategoryReducer from "../features/beach-restaurant/beverageCategorySlice";
import beverageReducer from "../features/beach-restaurant/beverageSlice";
import selectedRoomsReducer from "../features/rooms/selectedRoomsSlice";
import authReducer from "../features/auth/authSlice";
import restaurantSummaryReducer from "../features/beach-restaurant/restaurantSummarySlice";
import completedOrdersReducer from "../features/beach-restaurant/completedOrdersSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        onboarding: onboardingReducer,
        invoice: invoiceReducer,
        order: orderReducer,
        food: foodReducer,
        booking: bookingReducer,
        removedRooms: removedRoomsReducer,
        foodCategory: foodCategoryReducer,
        holdOrder: holdOrderReducer,
        dailyOrderSummary: dailyOrderSummaryReducer,
        beverageCategory: beverageCategoryReducer,
        beverage: beverageReducer,
        rooms: selectedRoomsReducer,
        auth: authReducer,
        restaurantSummary: restaurantSummaryReducer,
        completedOrders: completedOrdersReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;