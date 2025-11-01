import type { Booking } from "@/types/guestDetails";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";

interface OldRoom {
  roomNo: string;
  discountPrice: number; // stored internally in LKR
  finalRoomTotalPrice: number; // stored in LKR
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
  const { rates, loading } = useRates();
  const { displayCurrency } = useCurrency();

  // Internal state in LKR
  const [rooms, setRooms] = useState(
    guestDetails?.activeRooms.map((r) => ({
      ...r,
      discountPrice: 0, // in LKR
      finalRoomTotalPrice: r.roomTotalPrice, // in LKR
    })) || []
  );

  // Sync with guestDetails when it changes
  useEffect(() => {
    if (!guestDetails?.activeRooms) return setRooms([]);
    const updatedRooms = guestDetails.activeRooms.map((r) => ({
      ...r,
      discountPrice: 0,
      finalRoomTotalPrice: r.roomTotalPrice,
    }));
    setRooms(updatedRooms);

    if (onTotalChange) {
      const total = updatedRooms.reduce((sum, r) => sum + r.finalRoomTotalPrice, 0);
      onTotalChange(total);
    }
  }, [guestDetails, onTotalChange]);

  if (!rooms.length || loading) return null;

  // Convert input from USD/LKR to internal LKR
  const currencyToLKR = (amount: number) => {
    if (displayCurrency === "USD") {
      const rate = rates["LKR_USD"] || 1;
      return amount / rate; // convert USD -> LKR
    }
    return amount; // LKR
  };

  const handleDiscountChange = (roomNo: string, value: number) => {
    const discountLKR = currencyToLKR(value);

    setRooms((prev) => {
      const updatedRooms = prev.map((room) =>
        room.roomNo === roomNo
          ? {
              ...room,
              discountPrice: discountLKR,
              finalRoomTotalPrice: Math.max(room.roomTotalPrice - discountLKR, 0),
            }
          : room
      );

      if (onTotalChange) {
        const total = updatedRooms.reduce((sum, r) => sum + r.finalRoomTotalPrice, 0);
        onTotalChange(total);
      }

      return updatedRooms;
    });
  };

  const handleRemoveRoom = (room: any) => {
    setRooms((prevRooms) => {
      const updatedRooms = prevRooms.filter((r) => r.roomNo !== room.roomNo);
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
      <ul className="flex flex-col gap-5 mt-2">
        {rooms.map((room) => {
          // Display values in selected currency
          const perDayPriceDisplay = convertAndFormatPrice(room.perDayPrice, rates, displayCurrency);
          const finalTotalDisplay = convertAndFormatPrice(room.finalRoomTotalPrice, rates, displayCurrency);

          // Show discount input in selected currency
          const discountInputValue =
            displayCurrency === "USD"
              ? room.discountPrice * (rates["LKR_USD"] || 1)
              : room.discountPrice;

          return (
            <li
              key={room.roomNo}
              className="border rounded-lg p-3 bg-gray-50 shadow-sm"
            >
              {/* Room header */}
              <div className="flex items-center justify-between text-gray-800">
                <h2 className="text-lg font-medium">Room {room.roomNo}</h2>
                <div className="text-lg font-medium">{perDayPriceDisplay}</div>
              </div>
              <div className="text-sm text-right text-gray-500">Per Day</div>

              {/* Facilities */}
              <div className="mt-4 text-sm text-gray-700">
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
                  max={
                    displayCurrency === "USD"
                      ? room.roomTotalPrice * (rates["LKR_USD"] || 1)
                      : room.roomTotalPrice
                  }
                  value={discountInputValue}
                  onChange={(e) => handleDiscountChange(room.roomNo, Number(e.target.value))}
                  className="border rounded px-2 py-1 w-30"
                />
              </div>

              {/* Final total */}
              <div className="flex gap-2 text-gray-800 mt-2">
                <span>Final Total: </span>
                <span>{finalTotalDisplay}</span>
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
          );
        })}
      </ul>
    </div>
  );
};

export default SwitchRoomCollection;
