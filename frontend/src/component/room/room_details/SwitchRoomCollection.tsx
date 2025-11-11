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
  switchRoom?: boolean;
}

const SwitchRoomCollection: React.FC<SwitchRoomCollectionProps> = ({
  guestDetails,
  onTotalChange,
  onRemoveRoom,
  switchRoom,
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
      const total = updatedRooms.reduce(
        (sum, r) => sum + r.finalRoomTotalPrice,
        0
      );
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
              finalRoomTotalPrice: Math.max(
                room.roomTotalPrice - discountLKR,
                0
              ),
            }
          : room
      );

      if (onTotalChange) {
        const total = updatedRooms.reduce(
          (sum, r) => sum + r.finalRoomTotalPrice,
          0
        );
        onTotalChange(total);
      }

      return updatedRooms;
    });
  };

  const handleRemoveRoom = (room: any) => {
    setRooms((prevRooms) => {
      const updatedRooms = prevRooms.filter((r) => r.roomNo !== room.roomNo);
      if (onTotalChange) {
        const total = updatedRooms.reduce(
          (sum, r) => sum + r.finalRoomTotalPrice,
          0
        );
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
          const perDayPriceDisplay = convertAndFormatPrice(
            room.perDayPrice,
            rates,
            displayCurrency
          );
          const finalTotalDisplay = convertAndFormatPrice(
            room.finalRoomTotalPrice,
            rates,
            displayCurrency
          );

          // Show discount input in selected currency
          const discountInputValue =
            displayCurrency === "USD"
              ? room.discountPrice * (rates["LKR_USD"] || 1)
              : room.discountPrice;

          return (
            <li
              key={room.roomNo}
              className="border rounded-xl p-4 bg-gray-50 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-700">
                  Room - {room.roomNo}
                </h2>
                <div className="text-base font-semibold text-Primary_blue">
                  {perDayPriceDisplay}
                </div>
              </div>
              <div className="text-[11px] text-right text-gray-400">
                Per Day
              </div>

              {/* Facilities */}
              <div className="mt-4 p-3 rounded-lg bg-white border text-sm">
                <span className="font-medium">Facilities:</span>
                {room.facilities?.length > 0 ? (
                  <ul className="list-disc ml-5 mt-1 text-gray-600">
                    {room.facilities.map((facility: string, idx: number) => (
                      <li key={idx}>{facility}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-gray-500">None</span>
                )}
              </div>

              {/* Discount Input */}
              {switchRoom && (
                <div className="mt-4 flex items-center justify-between">
                  <label className="text-sm text-gray-600 font-medium">
                    Discount
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={
                      displayCurrency === "USD"
                        ? room.roomTotalPrice * (rates["LKR_USD"] || 1)
                        : room.roomTotalPrice
                    }
                    value={discountInputValue}
                    onChange={(e) =>
                      handleDiscountChange(room.roomNo, Number(e.target.value))
                    }
                    className="border rounded-lg px-2 py-1 w-[130px] bg-white shadow-sm focus:ring focus:ring-Primary_blue/40 outline-none text-sm"
                  />
                </div>
              )}

              {/* Final Total */}
              <div className="mt-4 flex justify-between text-sm font-medium text-gray-700 bg-white p-2 rounded-lg border">
                <span>Final Total</span>
                <span className="truncate max-w-[140px]">
                  {finalTotalDisplay}
                </span>
              </div>

              {/* Delete Button */}
              {switchRoom && (
                <div className="flex justify-end mt-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-100 rounded-full"
                    onClick={() => handleRemoveRoom(room)}
                  >
                    <Trash2 className="text-red-500" />
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SwitchRoomCollection;
