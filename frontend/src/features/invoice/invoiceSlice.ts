import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Room {
  category: string;
  count: number;
  price: number;
}

export interface invoiceData {
  hotelType: string;
  customerName: string;
  travelAgentName: string;
  adults: number;
  kids: number;
  checkIn: string;
  checkOut: string;
  lengthOfStay: number;
  totalGuests: number;
  currencyType: string;   // ← ADD THIS
  rooms: { category: string; count: number; price: number }[];
  total: number;          // ← ADD THIS
}


interface invoiceState {
  invoiceFormData: invoiceData;
}

const initialState: invoiceState = {
  invoiceFormData: {
    customerName: "",
    travelAgentName: "",
    adults: 0,
    kids: 0,
    checkIn: "",
    checkOut: "",
    lengthOfStay: 0,
    totalGuests: 0,
    hotelType: "",
    currencyType: "",
    total: 0,

    // ✅ Default room list (one empty row)
    rooms: [
      {
        category: "",
        count: 1,
        price: 0,
      },
    ],
  },
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setInvoiceData: (state, action: PayloadAction<Partial<invoiceData>>) => {
      state.invoiceFormData = { ...state.invoiceFormData, ...action.payload };
    },

    // ✅ Optional helper: update specific rooms array
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.invoiceFormData.rooms = action.payload;
    },

    // ✅ Optional helper: reset form to initial
    resetInvoiceForm: (state) => {
      state.invoiceFormData = initialState.invoiceFormData;
    },
  },
});

export const { setInvoiceData, setRooms, resetInvoiceForm } = invoiceSlice.actions;
export default invoiceSlice.reducer;
