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
  setIsPrintedForNewOrderToken,
} from "@/features/beach-restaurant/orderSlice";
import { addNewOrderTokenToOrder } from "@/api/order/add-new-order-token-to-order-api";
import { fetchOrderById } from "@/api/order/get-order-data-api";
import { toast } from "react-toastify";
import { useState } from "react";

interface OrderTokenDialogProps {
  id: string;
}

export default function OrderBillDetailsModal({ id }: OrderTokenDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);
  const [discount, setDiscount] = useState(0);

  const handlePrint = async () => {
    try {
      dispatch(setIsPrintedForNewOrderToken(true));

      await dispatch(addNewOrderTokenToOrder({ orderId: id })).unwrap();
      await dispatch(fetchOrderById(id)).unwrap();

      toast.success("Order token printed successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to print order token. Please try again.");
    }
  };

  // Calculate totals
  const subtotal = order.totalBill || 0;
  //const tax = subtotal * 0.05; // Example: 5% tax
  const tax = 0;
  const serviceCharge = subtotal * 0.1; // Example: 10% service charge
  const discountAmount = (discount / 100) * subtotal;
  const total = subtotal + tax + serviceCharge - discountAmount;

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
            Order Summary
          </DialogTitle>
        </DialogHeader>

        {/* Order Details Section */}
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

        {/* Divider */}
        <hr className="my-4 border-gray-300" />

        {/* Discount Input */}
        <div className="flex flex-col gap-2 mb-2">
          <label className="text-sm font-medium">Discount (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            placeholder="Enter discount percentage"
            className="!text-sm"
          />
        </div>

        {/* Bill Breakdown */}
        <div className="space-y-2 mt-4 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>{subtotal.toFixed(2)} LKR</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Tax (5%):</span>
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
            <span>{total.toFixed(2)} LKR</span>
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-5">
          <Button onClick={handlePrint} className="w-full cursor-pointer">
            Select Payment Method
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
