import RoomDetails from "@/component/onboarding/step02/RoomDetails";
import RoomGrid from "@/component/onboarding/step02/RoomGrid";
import { useState } from "react";
import type { Room } from "@/types/roomTypes";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

const RoomAvailability = () => {
  const rooms = useSelector((state: RootState) => state.rooms.rooms); // just display, no state changes
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);

  const handleRoomClick = (room: Room) => {
    setViewedRoom(room); // only set viewed room, no selection or booking
  };

  const guestDetails = useSelector((state: RootState) => state.onboarding.step01Data);

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
          guestDetails={guestDetails} // just a dummy or optional
          grandTotal={0} // not used
          isModalOpen={false} // no modal
          onRemoveRoom={() => {}} // do nothing
          onBookRoom={() => {}} // do nothing
          onCloseModal={() => {}} // do nothing
          readOnly={true}
          checkout={false}
          invoice={false}
          switchRoom={false}
        />
      </div>
    </div>
  );
};

export default RoomAvailability;
