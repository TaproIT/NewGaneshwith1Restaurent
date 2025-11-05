"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "@/app/store";
import {
  closeOrderTokenModal,
  setIsPrintedForNewOrderToken,
} from "@/features/beach-restaurant/orderSlice";
import { addNewOrderTokenToOrder } from "@/api/order/add-new-order-token-to-order-api";
import { fetchOrderById } from "@/api/order/get-order-data-api";
import { toast } from "react-toastify";

interface OrderTokenDialogProps {
  id: string;
}

declare global {
  interface Window {
    qz: any;
  }
}

export default function OrderTokenDialog({ id }: OrderTokenDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);

  // 🔹 Load QZ Tray library dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
    script.async = true;
    script.onload = () => console.log("✅ QZ Tray loaded");
    document.body.appendChild(script);
  }, []);

  // 🔹 Setup QZ security config for unsigned development mode
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.qz) {
        window.qz.security.setCertificatePromise(() =>
          Promise.resolve("unsigned")
        );
        window.qz.security.setSignaturePromise((toSign: string) =>
          Promise.resolve("unsigned")
        );
        clearInterval(interval);
      }
    }, 1000);
  }, []);

  // 🔹 Handle Print with QZ Tray
  const handlePrint = async () => {
    try {
      if (!window.qz) {
        toast.error("QZ Tray not loaded. Please start QZ Tray and refresh.");
        return;
      }

      // Connect to QZ Tray
      await window.qz.websocket.connect().catch((err: any) => {
        if (err.message.includes("Already connected")) return;
        throw err;
      });

      // Find printer
      const printerName = "ET PT-30"; // Must match your QZ Tray printer name
      const foundPrinter = await window.qz.printers.find(printerName);
      if (!foundPrinter) {
        toast.error(`Printer "${printerName}" not found.`);
        return;
      }

      // Build thermal receipt text
      let printData = `
==============================
     ${order.serviceType?.toUpperCase()} ORDER
==============================
Order No: ${order.orderNumber}
Token: ${order.orderTokens.length + 1}
------------------------------
`;

      if (order.restaurantTable?._id) {
        printData += `Table: ${order.restaurantTable.name}\n`;
      }

      printData += "------------------------------\n";
      printData += "Items\n";
      printData += "------------------------------\n";

      order.newOrderToken.foodOrders.forEach((item) => {
        printData += `${item.title.padEnd(20)} ${item.quantity} x ${item.price.toFixed(
          2
        )}\n`;
      });

      order.newOrderToken.beverageOrders.forEach((item) => {
        printData += `${item.title.padEnd(20)} ${item.quantity} x ${item.price.toFixed(
          2
        )}\n`;
      });

      printData += `
------------------------------
Token Bill : ${order.newOrderToken.tokenTotalBill.toFixed(2)} LKR
Total Bill : ${order.totalBill.toFixed(2)} LKR
------------------------------
   Thank You & Come Again!
==============================
`;

      // Create QZ config
      const config = window.qz.configs.create(foundPrinter, {
        size: { width: 3, height: 2 },
        units: "in",
        density: "600dpi",
      });

      const data = [
        {
          type: "raw",
          format: "plain",
          data: printData,
        },
      ];

      // Print
      await window.qz.print(config, data);
      toast.success("🖨️ Printed successfully!");

      // 🔹 Backend updates after printing
      dispatch(setIsPrintedForNewOrderToken(true));
      await dispatch(addNewOrderTokenToOrder({ orderId: id })).unwrap();
      await dispatch(fetchOrderById(id)).unwrap();

      toast.success("✅ Order updated successfully after print!");
    } catch (err: any) {
      console.error("QZ print error:", err);
      toast.error("❌ Printing failed. Check QZ Tray or printer connection.");
    } finally {
      if (window.qz?.websocket.isActive()) {
        window.qz.websocket.disconnect();
      }
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

      <DialogContent className="!p-4 w-[325px] text-[#444444] printable-modal">
        <DialogHeader>
          <DialogTitle className="!px-2">
            Order {order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Token Info */}
          <div className="px-3 flex justify-between text-[0.875rem] text-[#444444] font-[500]">
            <span className="font-medium">
              Token {order.orderTokens.length + 1}
            </span>
            <span>{order.serviceType}</span>
          </div>

          {/* Table Info */}
          {order.restaurantTable?._id && (
            <div className="my-5 px-3 flex justify-between text-[0.75rem]">
              <span className="font-medium">
                Table : {order.restaurantTable.name}
              </span>
            </div>
          )}

          {/* Items Table */}
          <Table className="mt-5 border border-gray-300">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="text-[0.75rem] text-[#444444] font-[500] text-center border-r border-gray-300">
                  Item
                </TableHead>
                <TableHead className="text-[0.75rem] text-[#444444] font-[500] text-center border-r border-gray-300">
                  Qty
                </TableHead>
                <TableHead className="text-[0.75rem] text-[#444444] font-[500] text-center">
                  Price
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {order.newOrderToken.foodOrders.map((item) => (
                <TableRow key={item.foodId} className="border-b border-gray-300">
                  <TableCell className="text-[0.75rem] border-r border-gray-300">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-center border-r border-gray-300">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-right">
                    {(item.quantity * item.price).toLocaleString()} LKR
                  </TableCell>
                </TableRow>
              ))}
              {order.newOrderToken.beverageOrders.map((item) => (
                <TableRow
                  key={item.beverageId}
                  className="border-b border-gray-300"
                >
                  <TableCell className="text-[0.75rem] border-r border-gray-300">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-center border-r border-gray-300">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-right">
                    {(item.quantity * item.price).toLocaleString()} LKR
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Token Bill */}
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
            <Button onClick={handlePrint} className="!w-full cursor-pointer">
              Print via QZ Tray
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
