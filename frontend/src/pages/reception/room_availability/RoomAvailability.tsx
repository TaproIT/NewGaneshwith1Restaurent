import RoomDetails from "@/component/onboarding/step02/RoomDetails";
import RoomGrid from "@/component/onboarding/step02/RoomGrid";
import React, { useState } from "react";
import type { Room } from "@/types/roomTypes";
import { mockRooms } from "@/component/onboarding/step02/mockRooms";

const RoomAvailability = () => {
  const [rooms] = useState<Room[]>(mockRooms); // just display, no state changes
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);

  const handleRoomClick = (room: Room) => {
    setViewedRoom(room); // only set viewed room, no selection or booking
  };

  return (
    <div className="grid grid-cols-4 gap-5">
      {/* Left side: room grid */}
      <div className="col-span-3">
        <RoomGrid
          rooms={rooms}
          selectedRooms={[]} // no selected rooms needed
          onRoomClick={handleRoomClick} // only for viewing
          readOnly={true}
        />
      </div>

      {/* Right side: room details */}
      <div className="col-span-1">
        <RoomDetails
          viewedRoom={viewedRoom}
          selectedRooms={[]} // empty, no booking
          guestDetails={{ lengthOfStay: 0 }} // just a dummy or optional
          grandTotal={0} // not used
          isModalOpen={false} // no modal
          onRemoveRoom={() => {}} // do nothing
          onBookRoom={() => {}} // do nothing
          onCloseModal={() => {}} // do nothing
          readOnly={true}
        />
      </div>
    </div>
  );
};

export default RoomAvailability;
