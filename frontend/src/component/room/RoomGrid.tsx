import React, { useState } from "react";
import type { Room } from "@/types/roomTypes";

interface RoomGridProps {
  rooms: Room[];
  selectedRooms: Room[];
  onRoomClick: (room: Room) => void;
  readOnly: boolean;
}

const RoomGrid: React.FC<RoomGridProps> = ({
  rooms,
  selectedRooms,
  onRoomClick,
  readOnly,
}) => {
  // Determine visual status from room data
  const getStatus = (room: Room): "reserved" | "empty" | "maintain" | "selected" => {
    if (selectedRooms.find((r) => r.no === room.no)) return "selected";
    if (room.isMaintenance) return "maintain";
    if (room.isBooked) return "reserved";
    return "empty";
  };

  const getStatusColor = (status: string) => {
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

  // Legend counts
  const reservedCount = rooms.filter((r) => r.isBooked).length;
  const emptyCount = rooms.filter((r) => !r.isBooked && !r.isMaintenance).length;
  const maintainCount = rooms.filter((r) => r.isMaintenance).length;
  const selectedCount = selectedRooms.length;

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const handleRoomClick = (room: Room) => {
    onRoomClick(room);
    setActiveRoomId(room._id || null);
  };

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(60vh-120px)] overflow-auto">
      {/* Legend */}
      <div className="flex justify-end gap-3 mb-3 text-sm">
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-full bg-quaternary"></div>
          <span>
            Reserved <span>{reservedCount}</span>
          </span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-full bg-tertiary"></div>
          <span>
            Empty <span>{emptyCount}</span>
          </span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-full bg-quinary"></div>
          <span>
            Maintenance <span>{maintainCount}</span>
          </span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 rounded-full border-2 border-black"></div>
          <span>
            Selected <span>{selectedCount}</span>
          </span>
        </div>
      </div>

      {/* Rooms */}
      <div className="grid grid-cols-4 gap-4">
        {rooms.map((room) => {
          const status = getStatus(room);

          return !readOnly ? (
            <div
              key={room._id}
              className={`p-4 rounded-xl text-center h-22 
                ${getStatusColor(status)} 
                ${status !== "empty" ? "cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => status === "empty" && onRoomClick(room)}
            >
              <p className="font-bold">{room.no}</p>
              {status === "reserved" && <p className="text-sm">Booked</p>}
            </div>
          ) : (
            <div
              key={room._id}
              className={`p-4 rounded-xl text-center h-22 cursor-pointer
                ${getStatusColor(status)} ${
                activeRoomId === room._id ? "border-2 border-black" : ""
              }`}
              onClick={() => handleRoomClick(room)}
            >
              <p className="font-bold">{room.no}</p>
              {status === "reserved" && <p className="text-sm">Booked</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomGrid;
