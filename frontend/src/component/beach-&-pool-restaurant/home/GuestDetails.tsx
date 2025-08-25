import type { AppDispatch, RootState } from "@/app/store";
import { setGuestName, setRoomNumber } from "@/features/beach-restaurant/orderSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GuestDetails: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roomNumber, guestName } = useSelector((state: RootState) => state.order);

  return (
    <div className="flex flex-col">
      <p className="text-[#444444] text-[1rem] mb-3">Guest Details</p>

      <div className="w-full 2xl:w-11/12 grid grid-cols-3 gap-6">
        {/* Room Number */}
        <div className="flex items-center gap-2 2xl:gap-3">
          <Label htmlFor="roomNumber" className="text-sm font-medium text-[#444444]">
            Room Number
          </Label>
          <Input
            id="roomNumber"
            type="text"
            value={roomNumber}
            onChange={(e) => dispatch(setRoomNumber(e.target.value))}
            placeholder="Enter Room Number"
            className="py-6 flex-1"
          />
        </div>

        {/* Guest Name */}
        <div className="flex items-center gap-2 2xl:gap-3">
          <Label htmlFor="guestName" className="text-sm font-medium text-[#444444]">
            Guest Name
          </Label>
          <Input
            id="guestName"
            type="text"
            value={guestName}
            onChange={(e) => dispatch(setGuestName(e.target.value))}
            placeholder="Enter Guest Name"
            className="py-6 flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default GuestDetails;
