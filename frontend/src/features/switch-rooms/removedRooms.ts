// features/room/roomSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface OldRoom {
  roomNo: string;
  discountPrice: number;
  finalRoomTotalPrice: number;
}

interface RoomState {
  oldRooms: OldRoom[];
}

const initialState: RoomState = {
  oldRooms: [],
};

const removedRoomsSlice = createSlice({
  name: "removedRooms",
  initialState,
  reducers: {
    addOldRoom: (state, action: PayloadAction<OldRoom>) => {
      state.oldRooms.push(action.payload);
    },
    clearOldRooms: (state) => {
      state.oldRooms = [];
    },
  },
});

export const { addOldRoom, clearOldRooms } = removedRoomsSlice.actions;
export default removedRoomsSlice.reducer;
