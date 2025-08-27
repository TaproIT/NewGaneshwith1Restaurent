// src/features/rooms/roomsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Room } from "@/types/roomTypes";
import { mockRooms } from "@/component/onboarding/step02/mockRooms";

interface RoomsState {
  rooms: Room[];
}

const initialState: RoomsState = {
  rooms: mockRooms, // start with mock data
};

const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    updateRoomStatus: (
      state,
      action: PayloadAction<{ id: number; status: Room["status"] }>
    ) => {
      const room = state.rooms.find((r) => r.id === action.payload.id);
      if (room) {
        room.status = action.payload.status;
      }
    },
    // optionally update the entire room
    updateRoom: (state, action: PayloadAction<Room>) => {
      const index = state.rooms.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) state.rooms[index] = action.payload;
    },
  },
});

export const { updateRoomStatus, updateRoom } = roomsSlice.actions;
export default roomsSlice.reducer;
