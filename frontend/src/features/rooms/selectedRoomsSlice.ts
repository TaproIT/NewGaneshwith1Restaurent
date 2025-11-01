import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SelectedRoomsState {
  roomNumbers: string[];
}

const initialState: SelectedRoomsState = {
  roomNumbers: [],
};

const selectedRoomsSlice = createSlice({
  name: "selectedRooms",
  initialState,
  reducers: {
    setSelectedRooms: (state, action: PayloadAction<string[]>) => {
      state.roomNumbers = action.payload;
    },
    addRoom: (state, action: PayloadAction<string>) => {
      if (!state.roomNumbers.includes(action.payload)) {
        state.roomNumbers.push(action.payload);
      }
    },
    removeRoom: (state, action: PayloadAction<string>) => {
      state.roomNumbers = state.roomNumbers.filter(
        (roomNo) => roomNo !== action.payload
      );
    },
    clearRooms: (state) => {
      state.roomNumbers = [];
    },
  },
});

export const { setSelectedRooms, addRoom, removeRoom, clearRooms } =
  selectedRoomsSlice.actions;
export default selectedRoomsSlice.reducer;
