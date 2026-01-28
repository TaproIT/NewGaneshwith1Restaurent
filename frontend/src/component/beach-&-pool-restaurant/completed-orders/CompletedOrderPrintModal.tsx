import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";
import { toast } from "react-toastify";
import { getPrinter } from "@/util/printerConfig";
import type { CompletedOrder } from "@/types/completed-order";

interface CompletedOrderPrintModalProps {
  order: CompletedOrder | null;
  onClose: () => void;
}

declare global {
  interface Window {
    qz: any;
  }
}

const totalWidth = 42;
const qtyWidth = 3;
const priceWidth = 9;
const maxNameLength = totalWidth - qtyWidth - priceWidth;

function formatItemLine(name: string, qty: number, price: number) {
  const priceStr = price.toFixed(2);

  const lines: string[] = [];
  let remaining = name;
  while (remaining.length > maxNameLength) {
    lines.push(remaining.substring(0, maxNameLength));
    remaining = remaining.substring(maxNameLength);
  }
  lines.push(remaining);

  const firstLine =
    lines[0].padEnd(maxNameLength, " ") +
    qty.toString().padStart(qtyWidth, " ") +
    priceStr.padStart(priceWidth, " ");

  const otherLines = lines.slice(1).map((line) => line.padEnd(totalWidth, " "));

  return [firstLine, ...otherLines].join("\n");
}

const CompletedOrderPrintModal = ({ order, onClose }: CompletedOrderPrintModalProps) => {
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!order) return;

    const scriptId = "qz-tray-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
      script.onload = () => console.log("QZ Tray script loaded");
      document.body.appendChild(script);
    }
  }, [order]);

  if (!order) {
    return null;
  }

  const discountAmount = (order.discount / 100) * order.subTotal;
  const isFreeBill = order.paymentMethod === "Free Bill";

  const printReceipt = async () => {
    if (!window.qz) {
      toast.error("QZ Tray not loaded yet!");
      return;
    }

    setPrinting(true);

    const qz = window.qz;
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }

      const printerName = await getPrinter("thermal");
      const config = qz.configs.create(printerName);
      const ESC = "\x1B";
      const GS = "\x1D";

      const itemHeader =
        "Item".padEnd(maxNameLength, " ") +
        "Qty".padStart(qtyWidth, " ") +
        "Price".padStart(priceWidth, " ");

      let receiptData =
        ESC + "@" +
        ESC + "a" + "\x01" +
        "==========================================\n" +
        `${order.restaurantType === "Beach" ? "GANESH GARDEN BEACH CABANA" : "MARAKOLLIYA BEACH RESORT"}\n` +
        `${order.restaurantType === "Beach" ? "MAHI MAHI SEA FOOD RESTAURANT" : "SUNSET POOL BAR & RESTAURANT"}\n` +
        "Tangalle \n" +
        "==========================================\n" +
        ESC + "a" + "\x00" +
        `Order No      : ${order.orderNumber}\n` +
        `Service Type  : ${order.serviceType}\n` +
        `Customer Type : ${order.customerType}\n` +
        `Customer      : ${order.guestName || "Walk-in"}\n` +
        `${order.roomNumber !== "0" ? `Room No       : ${order.roomNumber}\n` : ""}` +
        `Payment Method: ${order.paymentMethod}\n` +
        `Date          : ${new Date(order.createdAt).toLocaleString()}\n` +
        `TP            : ${order.restaurantType === "Beach" ? "+94 472242529 / +94 705505705" : "+94 472244822 / +94 705505705"}\n` +
        "-".repeat(totalWidth) + "\n";

      receiptData += itemHeader + "\n";
      receiptData += "-".repeat(totalWidth) + "\n";

      (order.orderTokens || []).forEach((token) => {
        receiptData += " \n";

        const allItems = [
          ...(token.foodOrders || []),
          ...(token.beverageOrders || []),
        ];

        receiptData +=
          allItems
            .map((item) => formatItemLine(item.title, item.quantity, item.price * item.quantity))
            .join("\n") + "\n\n";
      });

      const padKey = (label: string) => label.padEnd(totalWidth - 12, " ");
      const amountPad = (amount: number) => `${amount.toFixed(2)} LKR`.padStart(12, " ");

      receiptData += "-".repeat(totalWidth) + "\n";
      receiptData += padKey("Subtotal:") + amountPad(isFreeBill ? 0 : order.subTotal) + "\n";
      receiptData += padKey("Service (10%):") + amountPad(isFreeBill ? 0 : order.serviceCharge) + "\n";
      receiptData += padKey(`Discount (${order.discount}%):`) + amountPad(isFreeBill ? 0 : -discountAmount) + "\n";
      receiptData += padKey("TOTAL BILL:") + amountPad(isFreeBill ? 0 : order.totalBill) + "\n";
      receiptData += "=".repeat(totalWidth) + "\n";

      receiptData +=
        ESC + "a" + "\x01" +
        "       Thank you! Come again!       \n\n\n" +
        "      \n\n\n" +
        GS + "V" + "\x00";

      await qz.print(config, [{ type: "raw", format: "plain", data: receiptData }]);
      toast.success("Receipt printed successfully!");
      onClose();
    } catch (error: any) {
      console.error("Printing error", error);
      toast.error(error?.message || "Print failed! Please try again.");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog
      open={!!order}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-full max-w-xl p-6">
        <DialogHeader>
          <DialogTitle>Order Bill Summary</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Order No:</span>
            <span>{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Service Type:</span>
            <span>{order.serviceType}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Customer:</span>
            <span>{order.guestName || "Walk-in"}</span>
          </div>
          {order.roomNumber !== "0" && (
            <div className="flex justify-between">
              <span className="font-medium">Room No:</span>
              <span>{order.roomNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-medium">Payment Method:</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Date:</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-4 border rounded-md max-h-56 overflow-y-auto">
          {(order.orderTokens || []).map((token) => (
            <div key={token._id} className="p-3 border-b last:border-0">
              <div className="flex text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1 border-b border-dashed border-gray-300 mb-1">
                <span className="w-1/2">Item</span>
                <span className="w-1/4 text-center">Quantity</span>
                <span className="w-1/4 text-right">Price</span>
              </div>
              {[...(token.foodOrders || []), ...(token.beverageOrders || [])].map((item, index) => (
                <div key={`${token._id}-${index}`} className="flex text-sm py-1">
                  <span className="w-1/2 break-words">{item.title}</span>
                  <span className="w-1/4 text-center">{item.quantity}</span>
                  <span className="w-1/4 text-right">
                    {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>{order.subTotal.toFixed(2)} LKR</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Service Charge (10%):</span>
            <span>{order.serviceCharge.toFixed(2)} LKR</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Discount:</span>
            <span>-{discountAmount.toFixed(2)} LKR</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="font-semibold">{order.totalBill.toFixed(2)} LKR</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={printing}>
            Cancel
          </Button>
          <Button onClick={printReceipt} disabled={printing}>
            {printing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Printing
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                 Print
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletedOrderPrintModal;
