import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/booking";
import { PaymentMethods } from "@/lib/enums/order-related-enums";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onOpenChange, booking }) => {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const paymentMethods = Object.values(PaymentMethods).filter(
  (method) => method.value !== "Room"
);

  const handleConfirm = () => {
    if (!selectedPayment) {
      alert("Please select a payment method.");
      return;
    }
    console.log("Selected Payment Method:", selectedPayment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Select a Payment Method
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {paymentMethods
            .filter((_, index) => {
              if (index === 3 && !booking?.bookingId) return false;
              return true;
            })
            .map((method) => (
              <div
                key={method.value}
                onClick={() => setSelectedPayment(method.value)}
                className={cn(
                  "border rounded-md py-3 px-4 cursor-pointer text-center font-medium transition",
                  selectedPayment === method.value
                    ? "bg-[#0A869D] text-white border-[#0A869D]"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                )}
              >
                {method.label}
              </div>
            ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleConfirm} className="w-full cursor-pointer">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
