import { createSlice} from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RoleState, UserRole } from "@/types/roleTypes";

const initialState: RoleState = {
    role: 'Reception' // Default role, can be changed based on user login
}

const roleSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserRole: (state, action: PayloadAction<UserRole>) => {
            state.role = action.payload;
        },
        resetRole: () => initialState,
    }
})

export const { setUserRole, resetRole } = roleSlice.actions;
export default roleSlice.reducer;