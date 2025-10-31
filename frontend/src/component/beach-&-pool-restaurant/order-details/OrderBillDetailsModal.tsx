"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "@/app/store";
import {
  closeOrderBillDetailsModal,
} from "@/features/beach-restaurant/orderSlice";
import { toast } from "react-toastify";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { updateOrderBillDetails } from "@/api/order/update-order-bill-details";
import { PaymentMethods } from "@/lib/enums/order-related-enums";
import { fetchOrderById } from "@/api/order/get-order-data-api";
import { useNavigate } from "react-router-dom";
import { updateBookingDetailsWithOrderId } from "@/api/order/update-booking-details-with-order-id-api";

interface OrderTokenDialogProps {
  id: string;
}

export default function OrderBillDetailsModal({ id }: OrderTokenDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);
  const [discount, setDiscount] = useState(0);
  const [step, setStep] = useState(1); // 1 = summary, 2 = payment selection
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const navigate = useNavigate();

  const paymentMethods = Object.values(PaymentMethods);

  // Bill calculations
  const subTotal = order.totalBill || 0;
  const tax = 0;
  const serviceCharge = subTotal * 0.1;
  const discountAmount = (discount / 100) * subTotal;
  const totalBill = subTotal + tax + serviceCharge - discountAmount;


  const updateOrderDetails = async () => {
    const orderData = {
      orderId: id,
      subTotal,
      tax,
      discount,
      serviceCharge,
      totalBill,
      paymentMethod: selectedPayment
    }

    const bookingData = {
       bookingId: order.bookingId,
       orderId: order._id,
       date: new Date(),
    }
     try {
      console.log(bookingData);
        await dispatch(updateOrderBillDetails(orderData)).unwrap();

       if (orderData.paymentMethod === PaymentMethods.ROOM.value) {
        await dispatch(updateBookingDetailsWithOrderId(bookingData)).unwrap();
       }

      //  //await dispatch(fetchOrderById(id)).unwrap();
        toast.success("Order payment has been successfully processed");

        navigate("/restaurant/home");

     } catch (err: any) {
       toast.error(
         err?.message ||
           "Unable to complete the payment. Please check your connection or try again."
       );
     }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedPayment) {
        toast.warning("Please select a payment method");
        return;
      }
      updateOrderDetails();
      dispatch(closeOrderBillDetailsModal());
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <Dialog
      open={order.isOrderBillDetailsOpen}
      onOpenChange={(open) => {
        if (!open) dispatch(closeOrderBillDetailsModal());
      }}
    >
      <DialogTrigger asChild></DialogTrigger>

      <DialogContent className="!p-5 w-[380px] text-[#444444]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            {step === 1 ? "Order Summary" : "Select Payment Method"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <>
            {/* Step 1: Summary */}
            <div className="space-y-2 mt-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Order Number:</span>
                <span>{order.orderNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Order Type:</span>
                <span>{order.serviceType || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Customer Name:</span>
                <span>{order.guestName || "Walk-in"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Customer Type:</span>
                <span>{order.customerType || "Regular"}</span>
              </div>
            </div>

            <hr className="my-4 border-gray-300" />

            <div className="flex flex-col gap-2 mb-2">
              <label className="text-sm font-medium">Discount (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  // Only update if the value is between 0 and 100
                  if (value >= 0 && value <= 100) {
                    setDiscount(value);
                  } else if (e.target.value === "") {
                    // Allow empty value for easy editing
                    setDiscount(0);
                  } else {
                    toast.warning("Discount must be between 0 and 100");
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent invalid characters like e, +, -, or .
                  if (["e", "E", "+", "-", ","].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="Enter discount percentage"
                className="!text-sm"
              />
            </div>

            <div className="space-y-2 mt-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>{subTotal.toFixed(2)} LKR</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax:</span>
                <span>{tax.toFixed(2)} LKR</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Service Charge (10%):</span>
                <span>{serviceCharge.toFixed(2)} LKR</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Discount:</span>
                <span>-{discountAmount.toFixed(2)} LKR</span>
              </div>
              <hr className="my-3 border-gray-300" />
              <div className="flex justify-between text-base font-semibold text-black">
                <span>Total Bill:</span>
                <span>{totalBill.toFixed(2)} LKR</span>
              </div>
            </div>

            <div className="mt-5">
              <Button onClick={handleNext} className="w-full cursor-pointer">
                Select Payment Method
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: Payment Method Selection */}
            <div className="space-y-3 mt-6">
              {paymentMethods.map((method) => (
                <div
                  key={method.value}
                  onClick={() => setSelectedPayment(method.value as any)}
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

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-[48%] cursor-pointer"
              >
                Back
              </Button>
              <Button onClick={handleNext} className="w-[48%] cursor-pointer">
                Confirm
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
