import type { Booking } from "@/types/guestDetails";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface OldRoom {
  roomNo: string;
  discountPrice: number;
  finalRoomTotalPrice: number;
}

interface SwitchRoomCollectionProps {
  guestDetails: Booking | null;
  onTotalChange?: (total: number) => void; // callback for total
  onRemoveRoom?: (oldRoom: OldRoom) => void; // callback for deleted room
}

const SwitchRoomCollection: React.FC<SwitchRoomCollectionProps> = ({
  guestDetails,
  onTotalChange,
  onRemoveRoom,
}) => {
  // Local state for rooms (temporary frontend list)
  const [rooms, setRooms] = useState(
    guestDetails?.activeRooms.map((r) => ({
      ...r,
      discountPrice: 0,
      finalRoomTotalPrice: r.roomTotalPrice,
    })) || []
  );

  // Sync with guestDetails when it changes
  useEffect(() => {
    setRooms([]);

    !guestDetails?.activeRooms && setRooms([])

    if (guestDetails?.activeRooms) {
      const updatedRooms = guestDetails.activeRooms.map((r) => ({
        ...r,
        discountPrice: 0,
        finalRoomTotalPrice: r.roomTotalPrice,
      }));
      setRooms(updatedRooms);

      // notify parent immediately
      if (onTotalChange) {
        const total = updatedRooms.reduce((sum, r) => sum + r.finalRoomTotalPrice, 0);
        onTotalChange(total);
      }
    }
  }, [guestDetails, onTotalChange]);

  if (!rooms?.length) return null;

  // Update discount for a room
  const handleDiscountChange = (roomNo: string, discount: number) => {
    setRooms((prev) => {
      const updatedRooms = prev.map((room) =>
        room.roomNo === roomNo
          ? {
              ...room,
              discountPrice: discount,
              finalRoomTotalPrice: Math.max(room.roomTotalPrice - discount, 0),
            }
          : room
      );

      // notify parent immediately
      if (onTotalChange) {
        const total = updatedRooms.reduce((sum, r) => sum + r.finalRoomTotalPrice, 0);
        onTotalChange(total);
      }

      return updatedRooms;
    });
  };

  // Remove room
  const handleRemoveRoom = (room: any) => {
    setRooms((prevRooms) => {
      const updatedRooms = prevRooms.filter((r) => r.roomNo !== room.roomNo);

      // notify parent immediately
      if (onTotalChange) {
        const total = updatedRooms.reduce((sum, r) => sum + r.finalRoomTotalPrice, 0);
        onTotalChange(total);
      }

      return updatedRooms;
    });

    const oldRoom: OldRoom = {
      roomNo: room.roomNo,
      discountPrice: room.discountPrice,
      finalRoomTotalPrice: room.finalRoomTotalPrice,
    };
    if (onRemoveRoom) onRemoveRoom(oldRoom);
  };

  return (
    <div>
      <ul className="flex flex-col gap-5 mt">
        {rooms.map((room) => (
          <li
            key={room.roomNo}
            className="border rounded-lg p-3 bg-gray-50 shadow-sm mt-2"
          >
            {/* Room header */}
            <div className="flex items-center justify-between text-gray">
              <h2 className="text-lg font-medium">Room {room.roomNo}</h2>
              <div className="text-lg font-medium">LKR {room.perDayPrice}</div>
            </div>
            <div className="text-sm text-right text-gray">Per Day</div>

            {/* Facilities */}
            <div className="mt-4 text-sm text-gray">
              <span className="font-medium">Facilities:</span>
              {room.facilities?.length > 0 ? (
                <ul className="list-disc list-inside ml-4 mt-1">
                  {room.facilities.map((facility: string, idx: number) => (
                    <li key={idx}>{facility}</li>
                  ))}
                </ul>
              ) : (
                <span className="ml-2">None</span>
              )}
            </div>

            {/* Discount input */}
            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm font-medium text-gray">Discount:</label>
              <input
                type="number"
                min={0}
                max={room.roomTotalPrice}
                value={room.discountPrice}
                onChange={(e) =>
                  handleDiscountChange(room.roomNo, Number(e.target.value))
                }
                className="border rounded"
              />
            </div>

            {/* Total price per room */}
            <div className="flex gap-2 text-gray mt-2">
              <span>Final Total : </span>
              <span>{room.finalRoomTotalPrice}</span>
            </div>

            {/* Delete button */}
            <div className="flex justify-end mt-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRoom(room)}
              >
                <Trash2 color="red" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SwitchRoomCollection;
