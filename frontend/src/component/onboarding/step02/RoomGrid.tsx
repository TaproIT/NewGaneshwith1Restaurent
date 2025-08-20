import React, { useState } from "react";
import type { Room, RoomStatus } from "@/types/roomTypes";

interface RoomGridProps {
  rooms: Room[];
  selectedRooms: Room[];
  onRoomClick: (room: Room) => void;
  readOnly: boolean;
}

const RoomGrid: React.FC<RoomGridProps> = ({ rooms, selectedRooms, onRoomClick, readOnly }) => {
  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "reserved":
        return "bg-quaternary text-gray";
      case "empty":
        return "bg-tertiary text-gray";
      case "maintain":
        return "bg-quinary text-gray";
      case "selected":
        return "border-2 border-black bg-tertiary text-gray";
      default:
        return "bg-gray-200";
    }
  };

  const reservedCount = rooms.filter((room) => room.status === "reserved").length;
  const emptyCount = rooms.filter((room) => room.status === "empty").length;
  const maintainCount = rooms.filter((room) => room.status === "maintain").length;
  const selectedCount = rooms.filter((room) => room.status === "selected").length;

  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);

  const handleRoomClick = (room: Room) => {
      onRoomClick(room);
    setActiveRoomId(room.id);
  };

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-auto">
      {/* Legend */}
      <div className="flex justify-end gap-3 mb-3 text-sm">
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-full bg-quaternary"></div>
          <span>Reserved <span>{reservedCount}</span></span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-full bg-tertiary"></div>
          <span>Empty <span>{emptyCount}</span></span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-full bg-quinary"></div>
          <span>Maintenance <span>{maintainCount}</span></span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-full border-2 border-black"></div>
          <span>Selected <span>{selectedCount}</span></span>
        </div>
      </div>

      {/* Rooms */}
      <div className="grid grid-cols-4 gap-4">
        {rooms.map((room) => (
          (!readOnly ? <div
            key={room.id}
            className={`p-4 rounded-xl text-center h-22 
              ${getStatusColor(room.status)} 
              ${room.status !== "empty" ? "cursor-not-allowed" : "cursor-pointer"}`}
            onClick={() => room.status === "empty" && onRoomClick(room)}
          >
            <p className="font-bold">{room.number}</p>
            {room.status === "reserved" && <p className="text-sm">{room.guest}</p>}
          </div> 
          : 
          <div
            key={room.id}
            className={`p-4 rounded-xl text-center h-22 cursor-pointer
              ${getStatusColor(room.status)} ${activeRoomId === room.id ? "border-2 border-black" : ""}`}
            onClick={() => handleRoomClick(room)}
          >
            <p className="font-bold">{room.number}</p>
            {room.status === "reserved" && <p className="text-sm">{room.guest}</p>}
          </div>)
        ))}
      </div>
    </div>
  );
};

export default RoomGrid;
