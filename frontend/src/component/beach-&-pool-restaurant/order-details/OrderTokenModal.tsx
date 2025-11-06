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

  // Use your ET PT 30 / POS80 printer name from QZ Tray
  const printerName = "POS80"; // or "ET PT 30"

  // 🔹 Load QZ Tray script
  useEffect(() => {
    if (window.qz) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
    script.async = true;
    script.onload = () => console.log("QZ Tray script loaded");
    document.body.appendChild(script);
  }, []);

  // 🔹 Setup QZ Tray unsigned mode (for dev)
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.qz) {
        window.qz.security.setCertificatePromise(() => Promise.resolve("unsigned"));
        window.qz.security.setSignaturePromise(() => Promise.resolve("unsigned"));
        clearInterval(interval);
      }
    }, 500);
  }, []);

  // 🔹 Connect QZ Tray
  const connectToQZ = async () => {
    if (!window.qz) throw new Error("QZ Tray not loaded");
    if (window.qz.websocket.isActive()) return;
    await window.qz.websocket.connect();
    console.log("Connected to QZ Tray");
  };

  // 🔹 Disconnect QZ Tray
  const disconnectFromQZ = async () => {
    if (window.qz && window.qz.websocket.isActive()) {
      await window.qz.websocket.disconnect();
      console.log("🔌 Disconnected from QZ Tray");
    }
  };

  // 🔹 ESC/POS Print Function for ET PT 30
  const handlePrint = async () => {
    try {
      if (!window.qz) {
        toast.error("⚠️ QZ Tray not loaded. Please start QZ Tray and refresh.");
        return;
      }

      await connectToQZ();

      const foundPrinter = await window.qz.printers.find(printerName);
      if (!foundPrinter) {
        toast.error(`❌ Printer "${printerName}" not found in QZ Tray.`);
        return;
      }

      // Build ESC/POS text for thermal printer
      let receipt = "\x1B\x40"; // Initialize printer
      receipt += "\x1B\x61\x01"; // Center alignment
      receipt += "============================\n";
      receipt += "      ORDER TOKEN\n";
      receipt += "============================\n";
      receipt += `Order No: ${order.orderNumber}\n`;
      receipt += `Token No: ${order.orderTokens.length + 1}\n`;
      receipt += `${order.serviceType?.toUpperCase()}\n`;
      if (order.restaurantTable?._id) {
        receipt += `Table: ${order.restaurantTable.name}\n`;
      }
      receipt += "----------------------------\n";
      receipt += "Item               Qty  Price\n";
      receipt += "----------------------------\n";

      // Add food orders
      order.newOrderToken.foodOrders.forEach((item: any) => {
        receipt += `${item.title.padEnd(16).substring(0, 16)} ${String(
          item.quantity
        ).padStart(2)} ${(item.price * item.quantity)
          .toString()
          .padStart(6)}\n`;
      });

      // Add beverage orders
      order.newOrderToken.beverageOrders.forEach((item: any) => {
        receipt += `${item.title.padEnd(16).substring(0, 16)} ${String(
          item.quantity
        ).padStart(2)} ${(item.price * item.quantity)
          .toString()
          .padStart(6)}\n`;
      });

      receipt += "----------------------------\n";
      receipt += `Token Bill: ${order.newOrderToken.tokenTotalBill.toFixed(2)} LKR\n`;
      receipt += `Total Bill: ${order.totalBill.toFixed(2)} LKR\n`;
      receipt += "============================\n";
      receipt += "   THANK YOU! COME AGAIN!   \n";
      receipt += "============================\n";
      receipt += "\n\n\n";
      receipt += "\x1D\x56\x00"; // Full paper cut

      const data = [{ type: "raw", format: "plain", data: receipt }];

      const config = window.qz.configs.create(foundPrinter, {
        copies: 1,
        jobName: "ET PT 30 Order Token",
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        colorType: "grayscale",
      });

      await window.qz.print(config, data);
      toast.success("🖨️ Printed successfully on ET PT 30!");

      // Update backend
      dispatch(setIsPrintedForNewOrderToken(true));
      await dispatch(addNewOrderTokenToOrder({ orderId: id })).unwrap();
      await dispatch(fetchOrderById(id)).unwrap();
      toast.success("Order updated successfully!");
    } catch (err: any) {
      console.error("❌ Printing error:", err);
      toast.error("Printing failed. Check printer/QZ Tray connection.");
    } finally {
      await disconnectFromQZ();
    }
  };

  // 🔹 Dialog UI
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
              {order.newOrderToken.beverageOrders.map((item: any) => (
                <TableRow key={item.beverageId}>
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
               Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
