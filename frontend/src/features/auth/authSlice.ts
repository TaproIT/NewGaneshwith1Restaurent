import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/api/axios";

interface AuthState {
  isForgotPasswordModalOpen: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: AuthState = {
  isForgotPasswordModalOpen: false,
  loading: false,
  error: null,
  success: null,
};

// Async thunk to call API for password reset request
export const resetPassword = createAsyncThunk<
  string,
  { token?: string; password: string },
  { rejectValue: string }
>(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/reset-password", { token, password });
      return response.data.message || "Password reset successful";
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Password reset failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setForgotPasswordModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isForgotPasswordModalOpen = action.payload;
    },
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
        state.isForgotPasswordModalOpen = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { setForgotPasswordModalOpen, resetAuthState } = authSlice.actions;
export default authSlice.reducer;