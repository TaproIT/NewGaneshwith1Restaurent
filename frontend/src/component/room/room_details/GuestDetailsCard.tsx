import type { Booking } from "@/types/guestDetails";
import React, { useEffect } from "react";

interface GuestDetailsCardProps {
  guestDetails: Booking | null;
  onDaysCalculated?: (days: number) => void; // callback to parent
  checkout?: boolean;
}

const GuestDetailsCard: React.FC<GuestDetailsCardProps> = ({
  guestDetails,
  onDaysCalculated,
  checkout
}) => {
  if (!guestDetails) return null;

  const today = new Date()

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
      (today.getTime() - checkInDate.getTime() ) / (1000 * 60 * 60 * 24)
    ) - 1 || 1;

    const readOnlydaysStayed =
    Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime() ) / (1000 * 60 * 60 * 24)
    )|| 1;

  // 🔹 Send value to parent whenever it changes
  useEffect(() => {
    if (onDaysCalculated) {
      onDaysCalculated(daysStayed);
    }
  }, [daysStayed, onDaysCalculated]);

 return (
  <div className="mt-4 p-4 bg-white border rounded-xl shadow-sm text-sm space-y-3">

    <div className="flex justify-between">
      <span className="text-gray-500">Customer</span>
      <span className="font-medium text-gray-800">{guestDetails.guestName}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Days of Staying</span>
      <span className="font-medium text-gray-800">{!checkout ? readOnlydaysStayed : daysStayed} days</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Checked-In Date</span>
      <span className="font-medium text-gray-800">{formatDate(checkInDate)}</span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-500">Check-Out Date</span>
      <span className="font-medium text-gray-800">{formatDate( !checkout ? checkOutDate : today)}</span>
    </div>

  </div>
);
};

export default GuestDetailsCard;
