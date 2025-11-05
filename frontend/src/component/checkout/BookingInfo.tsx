import React from "react";
import { Label } from "@/components/ui/label";
import type { Booking } from "@/types/booking";
// import { useCurrency } from "@/context/CurrencyContext";
// import { useRates } from "@/context/RateContext";

interface Props {
  booking: Booking;
  discount: number; // stored internally in LKR
  setDiscount: (value: number) => void; // callback to update internal discount (LKR)
}

const BookingInfo: React.FC<Props> = ({ booking, discount, setDiscount }) => {

  return (
    <>
      <div className="font-semibold text-xl mb-4 text-center">Checkout Details</div>

      <div className="text-sm text-gray-600 space-y-2">
        <div className="flex justify-between">
          <span>Booking Id</span>
          <span>{booking.bookingId}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer Name</span>
          <span>{booking.guestName}</span>
        </div>
        <div className="flex justify-between">
          <span>Hotel</span>
          <span>{booking.hotel}</span>
        </div>
        <div className="flex justify-between">
          <span>Checked In</span>
          <span>{booking.checkInDateLocal}</span>
        </div>
        <div className="flex justify-between">
          <span>Checked Out</span>
          <span>{booking.checkOutDateLocal}</span>
        </div>
      </div>

      <div className="my-5 flex items-center justify-between">
        <Label>Discount %</Label>
        <input
  type="number"
  min={0}
  max={100}
  value={discount}
  onChange={(e) => {
    const value = Number(e.target.value);
    if (value >= 0 && value <= 100) {
      setDiscount(value);
    }
  }}
  className="border px-2 py-1 rounded w-24 text-right"
/>
      </div>
    </>
  );
};

export default BookingInfo;
