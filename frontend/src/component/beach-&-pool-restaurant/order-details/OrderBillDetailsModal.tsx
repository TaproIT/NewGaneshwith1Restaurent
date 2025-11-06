import { useEffect, useState } from "react";
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
import { closeOrderBillDetailsModal } from "@/features/beach-restaurant/orderSlice";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { updateOrderBillDetails } from "@/api/order/update-order-bill-details";
import { PaymentMethods } from "@/lib/enums/order-related-enums";
import { useNavigate } from "react-router-dom";
import { updateBookingDetailsWithOrderId } from "@/api/order/update-booking-details-with-order-id-api";

interface OrderTokenDialogProps {
  id: string;
}

declare global {
  interface Window {
    qz: any;
  }
}

export default function OrderBillDetailsModal({ id }: OrderTokenDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);
  const [discount, setDiscount] = useState(0);
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const navigate = useNavigate();

  const paymentMethods = Object.values(PaymentMethods);

  const subTotal = order.subTotal || 0;
  const tax = 0;
  const serviceCharge = subTotal * 0.1;
  const discountAmount = (discount / 100) * subTotal;
  const totalBill = subTotal + tax + serviceCharge - discountAmount;

  /** ------------------ QZ Tray Setup ------------------ **/
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
    script.onload = () => console.log("✅ QZ Tray script loaded");
    document.body.appendChild(script);
  }, []);

  /**
   * Full-width item formatter for monospaced thermal printer.
   * Important: priceStr uses toFixed(2) WITHOUT commas so width is exact.
   */
  function formatItemLine(name: string, qty: number, price: number) {
    const totalWidth = 42; // characters per line for typical 80mm / POS80
    const qtyWidth = 3; // enough for quantities up to 3 digits
    const priceWidth = 9; // e.g. "12345.67" fits (including decimals)
    const maxNameLength = totalWidth - qtyWidth - priceWidth;

    // Ensure price string has fixed format and no thousands separators
    const priceStr = price.toFixed(2);

    // Split name into chunks that fit
    const lines: string[] = [];
    let remaining = name;
    while (remaining.length > maxNameLength) {
      lines.push(remaining.substring(0, maxNameLength));
      remaining = remaining.substring(maxNameLength);
    }
    lines.push(remaining);

    // First line contains name, qty, price
    const firstLine =
      lines[0].padEnd(maxNameLength, " ") +
      qty.toString().padStart(qtyWidth, " ") +
      priceStr.padStart(priceWidth, " ");

    // Subsequent lines just show name continuation (full width)
    const otherLines = lines.slice(1).map((l) => l.padEnd(totalWidth, " "));

    return [firstLine, ...otherLines].join("\n");
  }

  /** ------------------ Print Receipt ------------------ **/
  const printReceipt = async () => {
    if (!window.qz) {
      toast.error("QZ Tray not loaded yet!");
      return;
    }

    const qz = window.qz;
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
        console.log("✅ Connected to QZ Tray");
      }

      const printerName = "POS80";
      const config = qz.configs.create(printerName);
      const ESC = "\x1B";
      const GS = "\x1D";

      // Header/width constants (same as formatter)
      const totalWidth = 42;
      const qtyWidth = 3;
      const priceWidth = 9;
      const maxNameLength = totalWidth - qtyWidth - priceWidth;

      // Build column header using same widths so labels align with data
      const itemHeader =
        "Item".padEnd(maxNameLength, " ") +
        "Qty".padStart(qtyWidth, " ") +
        "Price".padStart(priceWidth, " ");

      let receiptData =
        ESC + "@" + // init
        ESC + "a" + "\x01" + // center
        "==========================================\n" +
        "        GANESH GARDEN BEACH HOTEL\n" +
        `          ${order.restaurantType} RESTAURANT BILL\n` +
        "==========================================\n" +
        ESC + "a" + "\x00" + // left align
        `Order No: ${order.orderNumber}\n` +
        `Service Type: ${order.serviceType}\n` +
        `Customer: ${order.guestName || "Walk-in"}\n` +
        `${order.roomNumber  ? `Room No: ${order.roomNumber}\n`:""}` +
        "-".repeat(totalWidth) + "\n";

      // Token-wise printing
      (order.orderTokens || []).forEach((token: any) => {
        receiptData += `Token #${token.tokenNumber}\n`;
        receiptData += "-".repeat(totalWidth) + "\n";

        const allItems = [
          ...(token.foodOrders || []),
          ...(token.beverageOrders || []),
        ];

        receiptData += itemHeader + "\n";
        receiptData += "-".repeat(totalWidth) + "\n";

        receiptData += allItems
          .map((item: any) =>
            // pass numeric price (price * qty) so priceStr matches displayed total
            formatItemLine(item.title, item.quantity, item.price * item.quantity)
          )
          .join("\n") + "\n\n";
      });

      // Totals (pad keys to align right part)
      const padKey = (label: string) => label.padEnd(totalWidth - 12, " "); // leave ~12 chars for the amount
      const amountPad = (amt: number) => `${amt.toFixed(2)} LKR`.padStart(12, " ");

      receiptData += "-".repeat(totalWidth) + "\n";
      receiptData += padKey("Subtotal:") + amountPad(subTotal) + "\n";
      receiptData += padKey("Service (10%):") + amountPad(serviceCharge) + "\n";
      receiptData += padKey(`Discount (${discount}%):`) + amountPad(-discountAmount) + "\n";
      receiptData += padKey("TOTAL BILL:") + amountPad(totalBill) + "\n";
      receiptData += "=".repeat(totalWidth) + "\n";

      receiptData +=
        ESC + "a" + "\x01" + // center
        "       Thank you! Come again!\n\n\n" +
        "      \n\n\n" +
        GS + "V" + "\x00"; // cut

      await qz.print(config, [{ type: "raw", format: "plain", data: receiptData }]);
      console.log("✅ Bill printed successfully!");
    } catch (err) {
      console.error("❌ Printing error:", err);
      toast.error("Print failed! Please check QZ Tray or printer connection.");
    }
  };

  /** ------------------ Update Order & Print ------------------ **/
  const updateOrderDetails = async () => {
    const orderData = {
      orderId: id,
      subTotal,
      tax,
      discount,
      serviceCharge,
      totalBill,
      paymentMethod: selectedPayment,
    };

    const bookingData = {
      bookingId: order.bookingId,
      orderId: order._id,
      date: new Date(),
    };

    try {
      await dispatch(updateOrderBillDetails(orderData)).unwrap();
      if (orderData.paymentMethod === PaymentMethods.ROOM.value) {
        await dispatch(updateBookingDetailsWithOrderId(bookingData)).unwrap();
      }
      await printReceipt();
      toast.success("Order payment processed & printed!");
      navigate("/restaurant/home");
    } catch (err: any) {
      toast.error(
        err?.message || "Unable to complete the payment. Please try again."
      );
    }
  };

  /** ------------------ UI Navigation ------------------ **/
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

  const handleBack = () => setStep(1);

  /** ------------------ UI Rendering ------------------ **/
  return (
    <Dialog
      open={order.isOrderBillDetailsOpen}
      onOpenChange={(open) => {
        if (!open) dispatch(closeOrderBillDetailsModal());
      }}
    >
      <DialogTrigger asChild></DialogTrigger>

      <DialogContent className="!p-5 w-[420px] text-[#444444] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            {step === 1 ? "Order Summary" : "Select Payment Method"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <>
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
            </div>

            {/* Token-wise items displayed properly */}
            <div className="mt-4 space-y-3 border-y py-3 text-sm">
              {(order.orderTokens || []).map((token: any) => (
                <div key={token._id} className="rounded-md p-3 pb-5">
                  {[
                    ...(token.foodOrders || []),
                    ...(token.beverageOrders || []),
                  ].map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between text-xs py-1 last:border-none"
                    >
                      <span className="w-[60%] break-words">{item.title}</span>
                      <span className="w-[20%] text-center">{item.quantity}</span>
                      <span className="w-[20%] text-right">
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <label className="text-sm font-medium">Discount (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && value <= 100) setDiscount(value);
                }}
              />
            </div>

            <div className="space-y-2 mt-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>{subTotal.toFixed(2)} LKR</span>
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
            <div className="space-y-3 mt-6">
              {paymentMethods
                .filter((_, index) => !(index === 3 && !order?.bookingId))
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

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack} className="w-[48%]">
                Back
              </Button>
              <Button onClick={handleNext} className="w-[48%]">
                Confirm & Print
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
