import RoomDetails from "@/component/room/RoomDetails";
import RoomGrid from "@/component/room/RoomGrid";
import { useEffect, useState } from "react";
import type { Room } from "@/types/roomTypes";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { api } from "@/api/axios";
import { useLocation } from "react-router-dom";

const RoomAvailability = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);

   const location = useLocation(); // detect route change

  useEffect(() => {
    setViewedRoom(null); // reset whenever route changes
  }, [location.pathname]);

  const handleRoomClick = (room: Room) => {
    setViewedRoom(room); // only set viewed room, no selection or booking
  };

  const guestDetails = useSelector(
    (state: RootState) => state.onboarding.step01Data
  );

  useEffect(() => {
      const fetchRooms = async () => {
        try {
          const res = await api.get("/room")
          console.log(res)
          setRooms(res.data)
        } catch (err) {
          console.error("Failed to fetch rooms:", err);
        }
      }
  
      fetchRooms();
    }, [])
  

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
