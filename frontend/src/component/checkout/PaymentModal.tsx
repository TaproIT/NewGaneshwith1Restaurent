import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/booking";
import { PaymentMethods } from "@/lib/enums/order-related-enums";
import { api } from "@/api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { printFinalBill } from "@/util/printCheckout"; // adjust path if different

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
  originalBillTotal: number;
  totalRoomCharge: number;
  totalOrdersPrice: number;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalBill: number;
  additionalPrice: { name: string; price: number }[];
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  booking,
  originalBillTotal,
  totalRoomCharge,
  totalOrdersPrice,
  subtotal,
  tax,
  serviceCharge,
  discount,
  totalBill,
  additionalPrice,
}) => {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const paymentMethods = Object.values(PaymentMethods).filter(
    (method) => method.value !== "Room"
  );

  const handleConfirm = async () => {
    if (!selectedPayment) {
      toast.error("Please select a payment method.");
      return;
    }

    const payload = {
      originalBillTotal,
      totalRoomCharge,
      totalOrdersPrice,
      additionalPrice,
      subtotal,
      tax,
      serviceCharge,
      discount,
      totalBill,
      paymentMethod: selectedPayment,
    };

    try {
      setLoading(true);

      const response = await api.post(`booking/final-billing/${booking.bookingId}/checkout`, payload);

      if (response.status === 200) {
        toast.success("Payment processed successfully!");
        await printFinalBill({
        booking,
        subtotal,
        tax,
        serviceCharge,
        discount,
        totalBill,
        additionalPrice,
        selectedPayment,
        totalRoomCharge,
        totalOrdersPrice,
      });
        onOpenChange(false);
        navigate("/checkouts");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      toast.error(error.response?.data?.message || "Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
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
          <Button
            onClick={handleConfirm}
            className="w-full cursor-pointer"
            disabled={loading}
          >
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
