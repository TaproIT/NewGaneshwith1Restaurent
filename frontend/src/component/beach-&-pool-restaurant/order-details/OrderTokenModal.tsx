"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "@/app/store";
import { closeOrderTokenModal, setIsPrintedForNewOrderToken } from "@/features/beach-restaurant/orderSlice";
import { addNewOrderTokenToOrder } from "@/api/order/add-new-order-token-to-order-api";
import { fetchOrderById } from "@/api/order/get-order-data-api";
import { toast } from "react-toastify";

interface OrderTokenDialogProps {
  id: string;
}

export default function OrderTokenDialog({ id }: OrderTokenDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);

  // Handle print button click
  const handlePrint = async () => {
    try {
      // Mark the current token as printed (local state)
      dispatch(setIsPrintedForNewOrderToken(true));

      // Add the new order token to the backend order
      await dispatch(addNewOrderTokenToOrder({ orderId: id })).unwrap();

      // Refresh the order data
      await dispatch(fetchOrderById(id)).unwrap();

      toast.success("Order token printed successfully");
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to print order token. Please try again."
      );
    }
  };

  return (
    <Dialog
      open={order.isOrderTokenOpen}
      onOpenChange={(open) => {
        if (!open) dispatch(closeOrderTokenModal());
      }}
    >
      <DialogTrigger asChild></DialogTrigger>

      <DialogContent className="!p-4 w-[325px] text-[#444444]">
        <DialogHeader>
          <DialogTitle className="!px-2">Order {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Token Info */}
          <div className="px-3 flex justify-between text-[0.875rem] text-[#444444] font-[500]">
            <span className="font-medium">Token {order.orderTokens.length + 1}</span>
            <span>{order.serviceType}</span>
          </div>

          {/* Table Info */}
          {order.tableId && (
            <div className="my-5 px-3 flex justify-between text-[0.75rem]">
              <span className="font-medium">Table :</span>
            </div>
          )}

          {/* Items Table */}
          <Table className="mt-5 border border-gray-300">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="text-[0.75rem] text-[#444444] font-[500] text-center border-r border-gray-300">Item</TableHead>
                <TableHead className="text-[0.75rem] text-[#444444] font-[500] text-center border-r border-gray-300">Qty</TableHead>
                <TableHead className="text-[0.75rem] text-[#444444] font-[500] text-center">Price</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {order.newOrderToken.foodOrders.map((item) => (
                <TableRow key={item.foodId} className="border-b border-gray-300">
                  <TableCell className="text-[0.75rem] text-[#444444] font-normal border-r border-gray-300">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-[#444444] font-normal text-center border-r border-gray-300">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-[#444444] font-normal text-right">
                    {(item.quantity * item.price).toLocaleString()} LKR
                  </TableCell>
                </TableRow>
              ))}
               {order.newOrderToken.beverageOrders.map((item) => (
                <TableRow key={item.beverageId} className="border-b border-gray-300">
                  <TableCell className="text-[0.75rem] text-[#444444] font-normal border-r border-gray-300">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-[#444444] font-normal text-center border-r border-gray-300">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-[#444444] font-normal text-right">
                    {(item.quantity * item.price).toLocaleString()} LKR
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Token bill */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[0.875rem] font-[500] pt-2">
            <span>Token Bill</span>
            <span>: {order.newOrderToken.tokenTotalBill.toFixed(2)} LKR</span>
          </div>

          {/* Total Bill */}
          <div className="mb-5 flex items-center justify-center gap-2 text-[0.875rem] font-[500] pt-2">
            <span>Total Bill</span>
            <span>: {order.totalBill.toFixed(2)} LKR</span>
          </div>

          {/* Print Button */}
          <div className="my-3 px-3 flex">
            <Button onClick={handlePrint} className="!w-full">
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
