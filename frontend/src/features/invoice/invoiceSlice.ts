import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface invoiceData {
    name: string;
    adults: number;
    kids: number;
    checkIn: string;
    checkOut: string;
    lengthOfStay: number;
    totalGuests: number;
}

interface invoiceState {
  invoiceFormData: invoiceData;
}

const initialState: invoiceState = {
    invoiceFormData: {
        name: "",
        adults: 0,
        kids: 0,
        checkIn: "",
        checkOut: "",
        lengthOfStay: 0,
        totalGuests: 0,
    }
}

const invoiceSlice = createSlice({
    name: "invoice",
    initialState,
    reducers: {
        setInvoiceData: (state, action: PayloadAction<Partial<invoiceData>>) => {
            state.invoiceFormData = { ...state.invoiceFormData, ...action.payload };
        },
    },
})

export const { setInvoiceData } = invoiceSlice.actions;
export default invoiceSlice.reducer;
