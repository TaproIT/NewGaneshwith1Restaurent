import type { Booking } from "@/types/guestDetails";
import React from "react";

interface GuestDetailsCardProps {
  guestDetails: Booking | null;
  onDaysCalculated?: (days: any) => void; // added this line #TODO
}

const GuestDetailsCard: React.FC<GuestDetailsCardProps> = ({
  guestDetails,
}) => {
  if (!guestDetails) return null;

  const checkInDate = new Date(guestDetails.checkIn);
  const checkOutDate = new Date(guestDetails.checkOut);

  // Format as YYYY-MM-DD
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  // Calculate days stayed
  const daysStayed =
    Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    ) || 0;

  return (
    <div className="flex flex-col mt-4 gap-1 text-sm">
      <div className="flex justify-between text-gray whitespace-nowrap">
        <div className="">Customer : </div>
        <div className="">{guestDetails.guestName}</div>
      </div>
      <div className="flex justify-between text-gray whitespace-nowrap">
        <div>Days of Staying : </div>
        <div>{daysStayed} days</div>
      </div>
      <div className="flex justify-between text-gray whitespace-nowrap">
        <div className="">Checked-In Date : </div>
        <div className="">{formatDate(checkInDate)}</div>
      </div>
      <div className="flex justify-between text-gray whitespace-nowrap">
        <div className="">Check Out Date : </div>
        <div className="">{formatDate(checkOutDate)}</div>
      </div>
    </div>
  );
};

export default GuestDetailsCard;
