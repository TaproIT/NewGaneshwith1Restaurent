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
  const printerName = "Pantum P2500 Series"; // ✅ must exactly match your printer’s name in QZ Tray

  // 🔹 Load QZ Tray dynamically
  useEffect(() => {
    if (window.qz) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
    script.async = true;
    script.onload = () => console.log("✅ QZ Tray script loaded");
    document.body.appendChild(script);
  }, []);

  // 🔹 Setup QZ security (unsigned mode for development)
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.qz) {
        window.qz.security.setCertificatePromise(() => Promise.resolve("unsigned"));
        window.qz.security.setSignaturePromise(() => Promise.resolve("unsigned"));
        clearInterval(interval);
      }
    }, 500);
  }, []);

  // 🔹 Connect to QZ Tray
  const connectToQZ = async () => {
    if (!window.qz) throw new Error("QZ Tray not loaded");
    if (window.qz.websocket.isActive()) {
      console.log("🔄 Reusing existing QZ connection");
      return;
    }
    console.log("🔌 Connecting to QZ Tray...");
    await window.qz.websocket.connect();
    console.log("✅ Connected to QZ Tray");
  };

  // 🔹 Disconnect QZ Tray
  const disconnectFromQZ = async () => {
    if (window.qz && window.qz.websocket.isActive()) {
      console.log("🔌 Disconnecting QZ Tray...");
      await window.qz.websocket.disconnect();
    }
  };

  // 🔹 Main print logic
  const handlePrint = async () => {
    try {
      if (!window.qz) {
        toast.error("⚠️ QZ Tray not loaded. Please start QZ Tray and refresh the page.");
        return;
      }

      await connectToQZ();

      const foundPrinter = await window.qz.printers.find(printerName);
      if (!foundPrinter) {
        toast.error(`❌ Printer "${printerName}" not found in QZ Tray.`);
        return;
      }

      // 🔸 Build print text
      let printData = `
========================================
        ${order.serviceType?.toUpperCase()} ORDER
========================================
Order No : ${order.orderNumber}
Token No : ${order.orderTokens.length + 1}
----------------------------------------
`;

      if (order.restaurantTable?._id) {
        printData += `Table : ${order.restaurantTable.name}\n`;
      }

      printData += "----------------------------------------\n";
      printData += "Items\n";
      printData += "----------------------------------------\n";

      order.newOrderToken.foodOrders.forEach((item: any) => {
        printData += `${item.title.padEnd(20)} ${item.quantity} x ${item.price.toFixed(2)}\n`;
      });

      order.newOrderToken.beverageOrders.forEach((item: any) => {
        printData += `${item.title.padEnd(20)} ${item.quantity} x ${item.price.toFixed(2)}\n`;
      });

      printData += `
----------------------------------------
Token Bill : ${order.newOrderToken.tokenTotalBill.toFixed(2)} LKR
Total Bill : ${order.totalBill.toFixed(2)} LKR
----------------------------------------
     Thank You & Come Again!
========================================
`;

      // 🔸 QZ Tray configuration (optimized for Pantum P2500 USB)
      const config = window.qz.configs.create(foundPrinter, {
        colorType: "grayscale",
        copies: 1,
        jobName: "Order Token",
        altPrinting: true,
        scaleContent: true,
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        density: "600dpi",
      });

      const data = [
        {
          type: "raw",
          format: "plain",
          data: printData,
        },
      ];

      // 🔸 Print now
      await window.qz.print(config, data);
      toast.success("🖨️ Printed successfully on Pantum P2500!");

      // 🔸 Backend updates after successful print
      dispatch(setIsPrintedForNewOrderToken(true));
      await dispatch(addNewOrderTokenToOrder({ orderId: id })).unwrap();
      await dispatch(fetchOrderById(id)).unwrap();

      toast.success("✅ Order updated successfully after print!");
    } catch (err: any) {
      console.error("❌ QZ print error:", err);
      toast.error("Printing failed. Check QZ Tray or printer connection.");
    } finally {
      await disconnectFromQZ();
    }
  };

  // 🔹 UI
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
          <div className="px-3 flex justify-between text-[0.875rem] text-[#444444] font-[500]">
            <span className="font-medium">
              Token {order.orderTokens.length + 1}
            </span>
            <span>{order.serviceType}</span>
          </div>

          {order.restaurantTable?._id && (
            <div className="my-5 px-3 flex justify-between text-[0.75rem]">
              <span className="font-medium">
                Table : {order.restaurantTable.name}
              </span>
            </div>
          )}

          <Table className="mt-5 border border-gray-300">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="text-[0.75rem] text-center border-r border-gray-300">
                  Item
                </TableHead>
                <TableHead className="text-[0.75rem] text-center border-r border-gray-300">
                  Qty
                </TableHead>
                <TableHead className="text-[0.75rem] text-center">
                  Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.newOrderToken.foodOrders.map((item: any) => (
                <TableRow key={item.foodId}>
                  <TableCell className="text-[0.75rem] border-r border-gray-300">{item.title}</TableCell>
                  <TableCell className="text-[0.75rem] text-center border-r border-gray-300">{item.quantity}</TableCell>
                  <TableCell className="text-[0.75rem] text-right">
                    {(item.quantity * item.price).toLocaleString()} LKR
                  </TableCell>
                </TableRow>
              ))}
              {order.newOrderToken.beverageOrders.map((item: any) => (
                <TableRow key={item.beverageId}>
                  <TableCell className="text-[0.75rem] border-r border-gray-300">{item.title}</TableCell>
                  <TableCell className="text-[0.75rem] text-center border-r border-gray-300">{item.quantity}</TableCell>
                  <TableCell className="text-[0.75rem] text-right">
                    {(item.quantity * item.price).toLocaleString()} LKR
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-5 flex justify-center gap-2 text-[0.875rem] font-[500]">
            <span>Token Bill</span>
            <span>: {order.newOrderToken.tokenTotalBill.toFixed(2)} LKR</span>
          </div>

          <div className="mb-5 flex justify-center gap-2 text-[0.875rem] font-[500]">
            <span>Total Bill</span>
            <span>: {order.totalBill.toFixed(2)} LKR</span>
          </div>

          <div className="my-3 px-3 flex">
            <Button onClick={handlePrint} className="!w-full cursor-pointer">
              Print via Pantum P2500
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
