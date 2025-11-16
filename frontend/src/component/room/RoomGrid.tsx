import React, { useState } from "react";
import type { Room } from "@/types/roomTypes";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useLocation } from "react-router-dom";

interface RoomGridProps {
  rooms: Room[];
  selectedRooms: Room[];
  onRoomClick?: (room: Room) => void;
  readOnly: boolean;
  onAddRoomClick?: () => void;
  roomConfigMode?: boolean;
  onAddRoomTypeClick?: () => void;
}

const RoomGrid: React.FC<RoomGridProps> = ({
  rooms,
  selectedRooms,
  onRoomClick,
  readOnly,
  onAddRoomClick,
  roomConfigMode,
}) => {
  // Determine visual status from room data
  const getStatus = (
    room: Room
  ): "reserved" | "empty" | "maintain" | "selected" => {
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
  const emptyCount = rooms.filter(
    (r) => !r.isBooked && !r.isMaintenance
  ).length;
  const maintainCount = rooms.filter((r) => r.isMaintenance).length;
  const selectedCount = selectedRooms.length;

  const userRole = useSelector((state: RootState) => state.user.role);
  const location = useLocation();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const currentPath = location.pathname;

  const handleRoomClick = (room: Room) => {
    onRoomClick?.(room);
    setActiveRoomId(room._id || null);
  };

  return (
    <div
      className={`p-6 rounded-2xl bg-mainWhite ${
        roomConfigMode ? "h-[calc(100vh-200px)]" : "h-[calc(100vh-140px)]"
      } overflow-y-auto`}
    >
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
        {userRole !== "Admin" && userRole !== "Super-Admin" && (
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full border-2 border-black"></div>
            <span>
              Selected <span>{selectedCount}</span>
            </span>
          </div>
        )}
      </div>

      {/* Rooms */}
      <div className="grid grid-cols-4 gap-4 overflow-auto">
        {(userRole === "Admin" || userRole === "Super-Admin") &&
          roomConfigMode && (
            <div
              className="p-4 rounded-xl text-center h-22 cursor-pointer bg-gray-100 flex flex-col items-center justify-center hover:bg-gray-200 transition border-Primary_blue border-1"
              onClick={onAddRoomClick}
            >
              <span className="text-3xl text-Primary_blue">+</span>
            </div>
          )}

        {rooms.map((room) => {
          const status = getStatus(room);

          // Determine if the room should be clickable
          const isClickable =
            currentPath === "/switch-rooms" || currentPath === "/checkouts"
              ? status === "reserved" // only reserved rooms clickable in switch-rooms
              : !readOnly
              ? status === "empty" // only empty rooms clickable in normal mode
              : true; // in readOnly, all clickable for viewing

          const handleClick = () => {
            if (isClickable) handleRoomClick(room);
          };

          return (
            <div
              key={room._id}
              className={`p-4 rounded-xl text-center h-22
                ${getStatusColor(status)}
                ${
                  isClickable
                    ? "cursor-pointer hover:opacity-90"
                    : "cursor-not-allowed opacity-60"
                }
                ${activeRoomId === room._id ? "border-2 border-black" : ""}
              `}
              onClick={handleClick}
            >
              <p className="font-bold">{room.no}</p>
              <p className="font-bold text-[10px]">{room.type?.type}</p>
              {status === "reserved" && <p className="text-sm">Booked</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomGrid;
