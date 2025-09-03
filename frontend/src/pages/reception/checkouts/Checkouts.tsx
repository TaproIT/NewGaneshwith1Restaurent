import { api } from "@/api/axios";
import type { RootState } from "@/app/store";
import RoomDetails from "@/component/room/RoomDetails";
import RoomGrid from "@/component/room/RoomGrid";
import type { Room } from "@/types/roomTypes";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Checkouts = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
    const [viewedRoom, setViewedRoom] = useState<Room | null>(null);
  
    const handleRoomClick = (room: Room) => {
      setViewedRoom(room); // only set viewed room, no selection or booking
    };
  
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
  
    const guestDetails = useSelector(
      (state: RootState) => state.onboarding.step01Data
    );
  

  return (
    <div className="grid grid-cols-4 gap-5">
      {/* Left side: room grid */}
      <div className="col-span-3 h-screen overflow-x-auto">
        <RoomGrid
          rooms={rooms}
          selectedRooms={[]} // no selected rooms needed
          onRoomClick={handleRoomClick} // only for viewing
          readOnly={true}
        />
      </div>

      {/* Right side: room details */}
      <div className="col-span-1 overflow-hidden">
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
          checkout={true}
          invoice={false}
          switchRoom={false}
          totalDays={0}
          whatsAppId=""
        />
      </div>
    </div>
  );
};

export default Checkouts;
