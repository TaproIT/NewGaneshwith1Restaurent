import React from "react";
import type { Booking } from "@/types/guestDetails";
import HeaderBadge from "./HeaderBadge";
import RoomDetailsSkeleton from "@/component/skeleton/RoomDetailsSkeleton";
import GuestDetailsCard from "./GuestDetailsCard";
import RoomsDetailsCard from "./RoomsDetailsCard";
import type { Room } from "@/types/roomTypes";

interface RoomDetailsPanelProps {
  viewedRoom: Room | null;
  readOnly: boolean;
  checkout?: boolean;
  bookingDetails?: { loading: boolean; roomData: Booking | null };
  selectedRooms: Room[];
  onDaysCalculated?: (days: number) => void;
}

const RoomDetailsPanel: React.FC<RoomDetailsPanelProps> = ({
  viewedRoom,
  readOnly,
  checkout,
  bookingDetails,
  selectedRooms,
  onDaysCalculated,
}) => {
  if (!viewedRoom || !readOnly) {
    return selectedRooms.length <= 0 ? (
      <p className="text-gray-500 mb-4">Select a room to view details</p>
    ) : null;
  }

  return (
    <>
      {!checkout && <HeaderBadge viewedRoom={viewedRoom} />}

      {bookingDetails?.loading ? (
        <RoomDetailsSkeleton />
      ) : (
        bookingDetails?.roomData && (
          <GuestDetailsCard
            guestDetails={bookingDetails.roomData}
            onDaysCalculated={onDaysCalculated}
          />
        )
      )}

      {!checkout && <RoomsDetailsCard viewedRoom={viewedRoom} />}

      <div className="absolute bottom-5 left-[25%] text-gray font-medium text-lg">
        <div className="flex justify-center items-center">
          LKR {viewedRoom.perDayPrice}
          <span className="px-2 font-normal text-sm">Per Day</span>
        </div>
      </div>
    </>
  );
};

export default RoomDetailsPanel;
