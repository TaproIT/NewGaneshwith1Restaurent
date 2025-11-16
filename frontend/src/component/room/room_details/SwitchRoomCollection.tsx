import type { Booking } from "@/types/guestDetails";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";

interface OldRoom {
  roomNo: string;
  discountPrice: number;
  finalRoomTotalPrice: number;
  currency: string;
}

interface SwitchRoomCollectionProps {
  guestDetails: Booking | null;
  onTotalChange?: (total: number) => void;
  onRemoveRoom?: (oldRoom: OldRoom) => void;
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

  // Calculate length of stay (from checkIn to today)
  const getLengthOfStay = () => {
    if (!guestDetails?.checkIn) return 1; // default 1 day
    const checkInDate = new Date(guestDetails.checkIn);
    const today = new Date();
    const diffTime = Math.max(today.getTime() - checkInDate.getTime(), 0);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // avoid zero
  };

  const lengthOfStay = getLengthOfStay();

  // Initial room state
  const [rooms, setRooms] = useState(
    guestDetails?.activeRooms.map((r) => {
      const roomTotalPrice = r.perDayPrice * lengthOfStay;
      return {
        ...r,
        discountPrice: 0,
        finalRoomTotalPrice: roomTotalPrice,
      };
    }) || []
  );

  // Update rooms when guestDetails change
  useEffect(() => {
    if (!guestDetails?.activeRooms) return setRooms([]);
    const lengthOfStay = getLengthOfStay();
    const updatedRooms = guestDetails.activeRooms.map((r) => {
      const roomTotalPrice = r.perDayPrice * lengthOfStay;
      return {
        ...r,
        discountPrice: 0,
        finalRoomTotalPrice: roomTotalPrice,
      };
    });
    setRooms(updatedRooms);

    if (onTotalChange) {
      const total = updatedRooms.reduce(
        (sum, r) => sum + r.finalRoomTotalPrice,
        0
      );
      onTotalChange(total);
    }
  }, [guestDetails]);

  if (!rooms.length || loading) return null;

  const handleDiscountChange = (roomNo: string, value: number) => {
    setRooms((prev) => {
      const updatedRooms = prev.map((room) =>
        room.roomNo === roomNo
          ? {
              ...room,
              discountPrice: value,
              finalRoomTotalPrice: Math.max(
                room.perDayPrice * lengthOfStay - value,
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
      currency: room.currency,
    };

    if (onRemoveRoom) onRemoveRoom(oldRoom);
  };

  return (
    <div>
      <ul className="flex flex-col gap-5 mt-2">
        {rooms.map((room) => {
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

          const discountInputValue =
            displayCurrency === "USD"
              ? room.discountPrice * (rates["LKR_USD"] || 1)
              : displayCurrency === "EUR"
              ? room.discountPrice * (rates["LKR_EUR"] || 1)
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
                <div className="flex items-center gap-3 justify-between bg-white p-3 rounded-xl shadow-sm border">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-1">
                      Currency
                    </label>
                    <select
                      value={room.currency}
                      onChange={(e) =>
                        setRooms((prev) =>
                          prev.map((r) =>
                            r.roomNo === room.roomNo
                              ? { ...r, currency: e.target.value }
                              : r
                          )
                        )
                      }
                      disabled
                      className="border rounded-lg px-2 py-1 bg-white text-sm focus:ring-2 focus:ring-Primary_blue focus:outline-none cursor-not-allowed"
                    >
                      <option value="LKR">LKR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="text-xs text-gray-500 mb-1">
                      Discount
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={room.perDayPrice * lengthOfStay}
                      value={discountInputValue}
                      onChange={(e) => {
                        const inputValue = Number(e.target.value);
                        const maxValue = room.perDayPrice * lengthOfStay;
                        const validValue = Math.min(inputValue, maxValue); // prevent going above max
                        handleDiscountChange(room.roomNo, validValue);
                      }}
                      className="border rounded-lg px-2 py-1 bg-white text-sm w-full focus:ring-2 focus:ring-Primary_blue focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Final Total */}
              <div className="mt-4 flex justify-between text-sm font-medium text-gray-700 bg-white p-2 rounded-lg border">
                <span>Final Total</span>
                <span className="truncate max-w-[140px]">
                  {finalTotalDisplay}
                  <div className="text-[11px] text-right text-gray-400">
                Per Day × {lengthOfStay} Days
              </div>
                </span>
              </div>

              {/* Remove Button */}
              {switchRoom && (
                <div className="flex justify-end mt-3">
                  <Button onClick={() => handleRemoveRoom(room)}>Update</Button>
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
