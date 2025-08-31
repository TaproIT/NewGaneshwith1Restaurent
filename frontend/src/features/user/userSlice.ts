import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RoleState, UserRole } from "@/types/roleTypes";
import { api } from "@/api/axios";

const initialState: RoleState = {
    role: 'Beach-Restaurant-Staff'
};

export const fetchUserRole = createAsyncThunk<UserRole>(
    'user/fetchUserRole',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/user-role');
            return response.data.data.userRole as UserRole;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data);
        }
    }
);

const roleSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserRole: (state, action: PayloadAction<UserRole>) => {
            state.role = action.payload;
        },
        resetRole: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUserRole.fulfilled, (state, action) => {
            state.role = action.payload;
        });
    }
});

export const { setUserRole, resetRole } = roleSlice.actions;
export default roleSlice.reducer;
