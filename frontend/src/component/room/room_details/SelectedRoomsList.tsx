import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Room } from "@/types/roomTypes";
import { convertAndFormatPrice } from "@/util/priceConverter";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";

interface SelectedRoomsListProps {
  selectedRooms: Room[];
  checkout?: boolean;
  guestDetails?: { lengthOfStay?: number };
  invoiceData?: { lengthOfStay?: number };
  totalDays: number;
  onRemoveRoom: (roomNo: string) => void;
}

const SelectedRoomsList: React.FC<SelectedRoomsListProps> = ({
  selectedRooms,
  checkout,
  guestDetails,
  invoiceData,
  totalDays,
  onRemoveRoom,
}) => {
  if (selectedRooms.length === 0) return null;
  const {rates} = useRates()
  const {displayCurrency} = useCurrency()

  const lengthOfStay = guestDetails?.lengthOfStay || invoiceData?.lengthOfStay || totalDays;

  return (
    <ul className="flex flex-col gap-5">
      {selectedRooms.map((room) => {
        const perDayPriceDisplay = convertAndFormatPrice(room.perDayPrice, rates, displayCurrency);
        const totalPriceDisplay = convertAndFormatPrice(room.perDayPrice * lengthOfStay, rates, displayCurrency);

        return (
        <li
          key={room._id}
          className={`border rounded-lg p-3 bg-gray-50 shadow-sm ${
            checkout && "mt-5"
          }`}
        >
          <div className="flex items-center justify-between text-gray">
            <h2 className="text-lg font-medium">Room {room.no}</h2>
            <div className="text-lg font-medium">{perDayPriceDisplay}</div>
          </div>
          <div className="text-sm text-right text-gray">Per Day</div>

          {/* Facilities */}
          <div className="mt-4 text-sm text-gray">
            <span className="font-medium">Facilities:</span>
            {room.facilities?.length > 0 ? (
              <ul className="list-disc list-inside ml-4 mt-1">
                {room.facilities.map((facility, index) => (
                  <li key={index}>{facility}</li>
                ))}
              </ul>
            ) : (
              <span className="ml-2">None</span>
            )}
          </div>

          {/* Total */}
          <div className="mt-5 grid grid-cols-3 text-gray">
            <span className="col-span-1">Total</span>
            <span className="col-span-1">:</span>
            <span className="col-span-1 text-left truncate max-w-[120px] text-sm cursor-pointer" title={totalPriceDisplay}>
              {totalPriceDisplay}
            </span>
          </div>

          {/* Remove button */}
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
      )})}
    </ul>
  );
};

export default SelectedRoomsList;
