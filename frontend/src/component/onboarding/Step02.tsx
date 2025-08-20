import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { saveBookedRoom } from "@/features/onboarding/onboardingSlice";
import RoomGrid from "./step02/RoomGrid";
import RoomDetails from "./step02/RoomDetails";
import type { Room } from "@/types/roomTypes";
import { mockRooms } from "./step02/mockRooms";

const Step02 = () => {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const guestDetails = useSelector((state: RootState) => state.onboarding.step01Data);
  const dispatch = useDispatch();

  const handleRoomClick = (room: Room) => {
    setViewedRoom(room);
    if (room.status !== "empty") return;

    setRooms(prev =>
      prev.map(r => r.id === room.id ? { ...r, status: r.status === "selected" ? "empty" : "selected" } : r)
    );

    setSelectedRooms(prev =>
      prev.find(r => r.id === room.id)
        ? prev.filter(r => r.id !== room.id)
        : [...prev, { ...room, status: room.status === "selected" ? "empty" : "selected" }]
    );
  };

  const handleRemoveRoom = (roomId: number) => {
    setSelectedRooms(prev => prev.filter(r => r.id !== roomId));
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: "empty" } : r));
    if (viewedRoom?.id === roomId) setViewedRoom(null);
  };

  const handleBook = (roomId: number, price: number) => {
    setIsModalOpen(true);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: "reserved" } : r));
    dispatch(saveBookedRoom({ id: roomId, price }));
    setSelectedRooms([]);
    setViewedRoom(null);
  };

  const grandTotal = selectedRooms.reduce((sum, room) => sum + guestDetails.lengthOfStay * room.price, 0);

  return (
    <div className="grid grid-cols-4 gap-5">
      <div className=" col-span-3">
      <RoomGrid rooms={rooms} selectedRooms={selectedRooms} onRoomClick={handleRoomClick} />
      </div>

      <div className="col-span-1">
      <RoomDetails
        viewedRoom={viewedRoom}
        selectedRooms={selectedRooms}
        guestDetails={guestDetails}
        grandTotal={grandTotal}
        isModalOpen={isModalOpen}
        onRemoveRoom={handleRemoveRoom}
        onBookRoom={handleBook}
        onCloseModal={() => setIsModalOpen(false)}
      />
      </div>
    </div>
  );
};

export default Step02;
