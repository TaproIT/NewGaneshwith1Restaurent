import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Room } from "@/types/roomTypes";
import type { SupportedCurrency } from "@/types/currency";
import type { BookedRoom } from "@/types/guestDataTypes";

interface SelectedRoomsListProps {
  selectedRooms: Room[];
  checkout?: boolean;
  guestDetails?: { lengthOfStay?: number };
  invoiceData?: { lengthOfStay?: number };
  totalDays: number;
  onRemoveRoom: (roomNo: string) => void;
  onUpdateRooms?: (rooms: BookedRoom[]) => void; // notify parent
}

interface EditableRoom extends Room {
  perDayPrice: number;
  currency: SupportedCurrency;
}

const SelectedRoomsList: React.FC<SelectedRoomsListProps> = ({
  selectedRooms,
  checkout,
  guestDetails,
  invoiceData,
  totalDays,
  onRemoveRoom,
  onUpdateRooms,
}) => {
  const lengthOfStay =
    guestDetails?.lengthOfStay || invoiceData?.lengthOfStay || totalDays;

  const [editableRooms, setEditableRooms] = useState<EditableRoom[]>([]);

  // Initialize editableRooms when selectedRooms changes
  useEffect(() => {
    const roomsWithCurrency: EditableRoom[] = selectedRooms.map((r) => ({
      ...r,
      perDayPrice: r.perDayPrice || r.price || 0,
      currency: (r.currency as SupportedCurrency) || "LKR",
    }));
    setEditableRooms(roomsWithCurrency);

    // Notify parent immediately on init
    onUpdateRooms?.(
      roomsWithCurrency.map((r) => ({
        roomNo: r.no,
        price: r.perDayPrice,
        currency: r.currency,
        totalPrice: r.perDayPrice * lengthOfStay,
      }))
    );
  }, [selectedRooms]);

  const handlePriceChange = (roomNo: string, newPrice: number) => {
    setEditableRooms((prev) => {
      const updated = prev.map((r) =>
        r.no === roomNo ? { ...r, perDayPrice: newPrice } : r
      );

      // Notify parent
      onUpdateRooms?.(
        updated.map((r) => ({
          roomNo: r.no,
          price: r.perDayPrice,
          currency: r.currency,
          totalPrice: r.perDayPrice * lengthOfStay,
        }))
      );

      return updated;
    });
  };

  const handleCurrencyChange = (newCurrency: SupportedCurrency) => {
    setEditableRooms((prev) => {
      const updated = prev.map((r) => ({ ...r, currency: newCurrency })); // update all rooms

      // Notify parent
      onUpdateRooms?.(
        updated.map((r) => ({
          roomNo: r.no,
          price: r.perDayPrice,
          currency: r.currency,
          totalPrice: r.perDayPrice * lengthOfStay,
        }))
      );

      return updated;
    });
  };

  if (editableRooms.length === 0) return null;

  return (
    <ul className="flex flex-col gap-5">
      {editableRooms.map((room) => {
        // const perDayPriceDisplay = convertAndFormatPrice(
        //   room.price ? room.price : room.perDayPrice,
        //   rates,
        //   room.currency
        // );
        // const totalPriceDisplay = convertAndFormatPrice(
        //   room.perDayPrice * lengthOfStay,
        //   rates,
        //   room.currency
        // );

        return (
          <li
            key={room._id}
            className={`border rounded-lg p-3 bg-gray-50 shadow-sm ${
              checkout && "mt-5"
            }`}
          >
            <div className="flex items-center justify-between text-gray">
              <h2 className="text-sm font-medium">Room-{room.no}</h2>
              <div className="text-lg font-medium text-Primary_blue">
                {room.currency} {room.price ? room.price : room.perDayPrice}
              </div>
            </div>

            <div className="text-[10px] text-right text-gray">Per Day</div>

            {/* Facilities */}
            <div className="my-2 text-sm text-gray p-5 rounded-2xl bg-white shadow-sm">
              <span className="font-medium">Facilities:</span>
              {room.facilities?.length > 0 ? (
                <ul className="list-disc list-inside ml-4 mt-1">
                  {room.facilities.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              ) : (
                <span className="ml-2">None</span>
              )}
            </div>

            {!checkout && (
              <div className="flex items-center gap-3 justify-between bg-white p-3 rounded-xl shadow-sm border">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Currency</label>
                  <select
                    value={room.currency}
                    onChange={(e) =>
                      handleCurrencyChange(e.target.value as SupportedCurrency)
                    }
                    className="border rounded-lg px-2 py-1 bg-white text-sm focus:ring-2 focus:ring-Primary_blue focus:outline-none"
                  >
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">
                    Per Day Price
                  </label>
                  <input
                    type="number"
                    value={room.perDayPrice}
                    onChange={(e) =>
                      handlePriceChange(room.no, Number(e.target.value))
                    }
                    className="border rounded-lg px-2 py-1 bg-white text-sm w-full focus:ring-2 focus:ring-Primary_blue focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Total */}
            <div className="mt-2 grid grid-cols-4 text-gray p-2 rounded-xl bg-white shadow-sm">
              <span className="col-span-1">Total</span>
              <span className="col-span-1">:</span>
              <span
                className="col-span-2 text-left truncate max-w-[140px] text-sm cursor-pointer"
                // title={totalPriceDisplay}
              >
                {room.currency} {room.perDayPrice * lengthOfStay}
              </span>
            </div>

            {!checkout && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveRoom(room.no)}
                >
                  <Trash2 color="red" />
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default SelectedRoomsList;
