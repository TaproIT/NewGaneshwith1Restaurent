import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import type { Booking } from "@/types/booking";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";

interface Props {
  booking: Booking;
  discount: number; // stored internally in LKR
  setDiscount: (value: number) => void; // callback to update internal discount (LKR)
}

const BookingInfo: React.FC<Props> = ({ booking, discount, setDiscount }) => {
  const { displayCurrency } = useCurrency();
  const { rates, loading } = useRates();
  const [displayDiscount, setDisplayDiscount] = useState(discount);

  useEffect(() => {
    if (loading || !rates) return;

    // convert internal discount (LKR) to current currency for display
    if (displayCurrency === "USD") {
      const rate = rates["LKR_USD"] || 1;
      setDisplayDiscount(discount * rate);
    } else {
      setDisplayDiscount(discount);
    }
  }, [displayCurrency, discount, rates, loading]);

  const handleDiscountChange = (value: number) => {
    setDisplayDiscount(value);

    // Convert back to LKR for internal storage
    if (displayCurrency === "USD") {
      const rate = rates["LKR_USD"] || 1;
      setDiscount(value / rate);
    } else {
      setDiscount(value);
    }
  };

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
        <Label>Discount ({displayCurrency})</Label>
        <input
          type="number"
          min={0}
          value={displayDiscount}
          onChange={(e) => handleDiscountChange(Number(e.target.value))}
          className="border px-2 py-1 rounded w-24 text-right"
        />
      </div>
    </>
  );
};

export default BookingInfo;
