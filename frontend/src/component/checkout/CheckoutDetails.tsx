import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/api/axios";
import type { Booking } from "@/types/booking";
import BookingInfo from "./BookingInfo";
import BillingTabs from "./BillingTabs";
import AdditionalCharges from "./AdditionalCharges";
import TotalSummary from "./TotalSummary";
import PaymentModal from "./PaymentModal";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";
import CheckoutSkeleton from "../skeleton/CheckoutSkeleton";

const CheckoutDetails: React.FC = () => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [discount, setDiscount] = useState(0);
  const [charges, setCharges] = useState<{ name: string; price: number }[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const id = useSelector((state: RootState) => state.booking.roomData?.bookingId)
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) navigate("/checkouts");
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/booking/final-billing/${id}/billing-summary`);
        setBooking(res.data);
      } catch (error) {
        console.error("Error fetching booking:", error);
      }
    };
    fetchBooking();
  }, [id]);

  if (!booking)
    return (
      <CheckoutSkeleton />
    );

  const subtotal =
    booking.totalRoomsCharges +
    booking.totalOrdersBill +
    charges.reduce((acc, c) => acc + (Number(c.price) || 0), 0);

  const tax = 0;
  const serviceCharge = 0;
  const discountAmount = discount;
  const total = subtotal + tax + serviceCharge - discountAmount;

  return (
    <div className="h-[calc(100vh-140px)] bg-white p-8 overflow-y-auto">
      <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-mainWhite rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <BookingInfo booking={booking} discount={discount} setDiscount={setDiscount} subtotal={subtotal}/>
            <BillingTabs booking={booking} />
          </div>
        </div>

        <div className="bg-mainWhite rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <AdditionalCharges charges={charges} setCharges={setCharges} />
            <TotalSummary
              subtotal={subtotal}
              tax={tax}
              serviceCharge={serviceCharge}
              discount={discountAmount}
              total={total}
            />
          </div>

          <div className="mt-6">
            <Button onClick={() => setIsPaymentModalOpen(true)} className="w-full text-white">
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>

      <PaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        booking={booking}
        originalBillTotal={booking.totalBill}
        totalRoomCharge={booking.totalRoomsCharges}
        totalOrdersPrice={booking.totalOrdersBill}
        subtotal={subtotal}
        tax={tax}
        serviceCharge={serviceCharge}
        discount={discount}
        totalBill={total}
        additionalPrice={charges}
      />
    </div>
  );
};

export default CheckoutDetails;
