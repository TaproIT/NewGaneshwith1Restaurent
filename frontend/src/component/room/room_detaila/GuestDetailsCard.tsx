import type { Step01FormData } from "@/types/guestDataTypes";
import React from "react";

interface GuestDetailsCardProps {
  guestDetails: Step01FormData;
}

const GuestDetailsCard: React.FC<GuestDetailsCardProps> = ({
  guestDetails,
}) => {
  return (
    <div className="flex flex-col mt-4 gap-1 text-sm">
      <div className="flex justify-between text-gray whitespace-nowrap">
        <div className="">Customer : </div>
        <div className="">{guestDetails.guestName}</div>
      </div>
      <div className="flex justify-between text-gray whitespace-nowrap">
        <div>Days of Staying : </div>
        <div>{guestDetails.lengthOfStay}</div>
      </div>
      <div className="flex justify-between text-gray whitespace-nowrap">
        <div className="">Checked-In Date : </div>
        <div className="">{guestDetails.checkIn}</div>
      </div>
      <div className="flex justify-between text-gray whitespace-nowrap">
        <div className="">Check Out Date : </div>
        <div className="">{guestDetails.checkOut}</div>
      </div>
    </div>
  );
};

export default GuestDetailsCard;
