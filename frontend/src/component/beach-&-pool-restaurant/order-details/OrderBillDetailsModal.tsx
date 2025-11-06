
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useDispatch, useSelector } from "react-redux";
// import { type AppDispatch, type RootState } from "@/app/store";
// import {
//   closeOrderBillDetailsModal,
// } from "@/features/beach-restaurant/orderSlice";
// import { toast } from "react-toastify";
// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import { updateOrderBillDetails } from "@/api/order/update-order-bill-details";
// import { PaymentMethods } from "@/lib/enums/order-related-enums";
// //import { fetchOrderById } from "@/api/order/get-order-data-api";
// import { useNavigate } from "react-router-dom";
// import { updateBookingDetailsWithOrderId } from "@/api/order/update-booking-details-with-order-id-api";

// interface OrderTokenDialogProps {
//   id: string;
// }

// export default function OrderBillDetailsModal({ id }: OrderTokenDialogProps) {
//   const dispatch = useDispatch<AppDispatch>();
//   const order = useSelector((state: RootState) => state.order);
//   const [discount, setDiscount] = useState(0);
//   const [step, setStep] = useState(1); // 1 = summary, 2 = payment selection
//   const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

//   const navigate = useNavigate();

//   const paymentMethods = Object.values(PaymentMethods);

//   // Bill calculations
//   const subTotal = order.totalBill || 0;
//   const tax = 0;
//   const serviceCharge = subTotal * 0.1;
//   const discountAmount = (discount / 100) * subTotal;
//   const totalBill = subTotal + tax + serviceCharge - discountAmount;


//   const updateOrderDetails = async () => {
//     const orderData = {
//       orderId: id,
//       subTotal,
//       tax,
//       discount,
//       serviceCharge,
//       totalBill,
//       paymentMethod: selectedPayment
//     }

//     const bookingData = {
//        bookingId: order.bookingId,
//        orderId: order._id,
//        date: new Date(),
//     }
//      try {
//       console.log(bookingData);
//         await dispatch(updateOrderBillDetails(orderData)).unwrap();

//        if (orderData.paymentMethod === PaymentMethods.ROOM.value) {
//         await dispatch(updateBookingDetailsWithOrderId(bookingData)).unwrap();
//        }

//       //  //await dispatch(fetchOrderById(id)).unwrap();
//         toast.success("Order payment has been successfully processed");

//         navigate("/restaurant/home");

//      } catch (err: any) {
//        toast.error(
//          err?.message ||
//            "Unable to complete the payment. Please check your connection or try again."
//        );
//      }
//   };

//   const handleNext = () => {
//     if (step === 1) {
//       setStep(2);
//     } else if (step === 2) {
//       if (!selectedPayment) {
//         toast.warning("Please select a payment method");
//         return;
//       }
//       updateOrderDetails();
//       dispatch(closeOrderBillDetailsModal());
//     }
//   };

//   const handleBack = () => {
//     setStep(1);
//   };

//   return (
//     <Dialog
//       open={order.isOrderBillDetailsOpen}
//       onOpenChange={(open) => {
//         if (!open) dispatch(closeOrderBillDetailsModal());
//       }}
//     >
//       <DialogTrigger asChild></DialogTrigger>

//       <DialogContent className="!p-5 w-[380px] text-[#444444]">
//         <DialogHeader>
//           <DialogTitle className="text-lg font-semibold text-center">
//             {step === 1 ? "Order Summary" : "Select Payment Method"}
//           </DialogTitle>
//         </DialogHeader>

//         {step === 1 ? (
//           <>
//             {/* Step 1: Summary */}
//             <div className="space-y-2 mt-4 text-sm">
//               <div className="flex justify-between">
//                 <span className="font-medium">Order Number:</span>
//                 <span>{order.orderNumber || "N/A"}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-medium">Order Type:</span>
//                 <span>{order.serviceType || "N/A"}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-medium">Customer Name:</span>
//                 <span>{order.guestName || "Walk-in"}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-medium">Customer Type:</span>
//                 <span>{order.customerType || "Regular"}</span>
//               </div>
//             </div>

//             <hr className="my-4 border-gray-300" />

//             <div className="flex flex-col gap-2 mb-2">
//               <label className="text-sm font-medium">Discount (%)</label>
//               <Input
//                 type="number"
//                 min="0"
//                 max="100"
//                 value={discount}
//                 onChange={(e) => {
//                   const value = Number(e.target.value);

//                   // Only update if the value is between 0 and 100
//                   if (value >= 0 && value <= 100) {
//                     setDiscount(value);
//                   } else if (e.target.value === "") {
//                     // Allow empty value for easy editing
//                     setDiscount(0);
//                   } else {
//                     toast.warning("Discount must be between 0 and 100");
//                   }
//                 }}
//                 onKeyDown={(e) => {
//                   // Prevent invalid characters like e, +, -, or .
//                   if (["e", "E", "+", "-", ","].includes(e.key)) {
//                     e.preventDefault();
//                   }
//                 }}
//                 placeholder="Enter discount percentage"
//                 className="!text-sm"
//               />
//             </div>

//             <div className="space-y-2 mt-4 text-sm">
//               <div className="flex justify-between">
//                 <span className="font-medium">Subtotal:</span>
//                 <span>{subTotal.toFixed(2)} LKR</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-medium">Tax:</span>
//                 <span>{tax.toFixed(2)} LKR</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-medium">Service Charge (10%):</span>
//                 <span>{serviceCharge.toFixed(2)} LKR</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-medium">Discount:</span>
//                 <span>-{discountAmount.toFixed(2)} LKR</span>
//               </div>
//               <hr className="my-3 border-gray-300" />
//               <div className="flex justify-between text-base font-semibold text-black">
//                 <span>Total Bill:</span>
//                 <span>{totalBill.toFixed(2)} LKR</span>
//               </div>
//             </div>

//             <div className="mt-5">
//               <Button onClick={handleNext} className="w-full cursor-pointer">
//                 Select Payment Method
//               </Button>
//             </div>
//           </>
//         ) : (
//           <>
//             {/* Step 2: Payment Method Selection */}
//             <div className="space-y-3 mt-6">
//               {paymentMethods
//                 .filter((_,index) => {
//                   // Show all methods except the 4th one unless order has bookingId
//                   if (index === 3 && !order?.bookingId) return false;
//                   return true;
//                 })
//                 .map((method) => (
//                   <div
//                     key={method.value}
//                     onClick={() => setSelectedPayment(method.value as any)}
//                     className={cn(
//                       "border rounded-md py-3 px-4 cursor-pointer text-center font-medium transition",
//                       selectedPayment === method.value
//                         ? "bg-[#0A869D] text-white border-[#0A869D]"
//                         : "border-gray-300 text-gray-700 hover:bg-gray-100"
//                     )}
//                   >
//                     {method.label}
//                   </div>
//                 ))}
//             </div>

//             <div className="flex justify-between mt-6">
//               <Button
//                 variant="outline"
//                 onClick={handleBack}
//                 className="w-[48%] cursor-pointer"
//               >
//                 Back
//               </Button>
//               <Button onClick={handleNext} className="w-[48%] cursor-pointer">
//                 Confirm
//               </Button>
//             </div>
//           </>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }


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

  /** Helper to format item line for printer **/
  function formatItemLine(name: string, qty: number, price: number) {
    const maxNameLength = 20;
    const lines = [];
    while (name.length > maxNameLength) {
      lines.push(name.substring(0, maxNameLength));
      name = name.substring(maxNameLength);
    }
    lines.push(name);
    const firstLine =
      lines[0].padEnd(maxNameLength, " ") +
      qty.toString().padStart(3, " ") +
      price.toString().padStart(8, " ");
    const otherLines = lines.slice(1).map((l) => l);
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

      let receiptData =
        ESC +
        "@" +
        ESC +
        "a" +
        "\x01" +
        "============================\n" +
        " GANESH GARDEN BEACH HOTEL\n" +
        "     POOL RESTAURANT BILL\n" +
        "============================\n" +
        ESC +
        "a" +
        "\x00" +
        `Order No: ${order.orderNumber}\n` +
        `Service Type: ${order.serviceType}\n` +
        `Customer: ${order.guestName || "Walk-in"}\n` +
        "----------------------------\n";

      // Token-wise printing
      (order.orderTokens || []).forEach((token: any) => {
        receiptData += `Token #${token.tokenNumber}\n`;
        receiptData += "----------------------------\n";
        const allItems = [
          ...(token.foodOrders || []),
          ...(token.beverageOrders || []),
        ];
        receiptData +=
          "Item                Qty  Price\n" +
          "----------------------------\n" +
          allItems
            .map((item: any) =>
              formatItemLine(item.title, item.quantity, item.price * item.quantity)
            )
            .join("\n") +
          "\n\n";
      });

      receiptData +=
        "----------------------------\n" +
        `Subtotal:           ${subTotal.toFixed(2)} LKR\n` +
        `Service (10%):      ${serviceCharge.toFixed(2)} LKR\n` +
        `Discount (${discount}%): -${discountAmount.toFixed(2)} LKR\n` +
        `TOTAL BILL:         ${totalBill.toFixed(2)} LKR\n` +
        "============================\n" +
        ESC +
        "a" +
        "\x01" +
        "   Thank you! Come again!\n\n\n" +
        GS +
        "V" +
        "\x00";

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
            {/* ✅ Show token-wise items */}
            <div className="mt-4 space-y-3 border-y py-3 text-sm">
              {(order.orderTokens || []).map((token: any) => (
                <div key={token._id} className="rounded-md p-3 pb-5">
                  {/* <p className="font-semibold mb-2 text-center">
                    Token #{token.tokenNumber}
                  </p> */}
                  {[
                    ...(token.foodOrders || []),
                    ...(token.beverageOrders || []),
                  ].map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between text-xs  py-1 last:border-none"
                    >
                      <span className="w-[60%]">{item.title}</span>
                      <span className="w-[20%] text-center">
                        {item.quantity}
                      </span>
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
                {" "}
                <span className="font-medium">Subtotal:</span>
                <span>{subTotal.toFixed(2)} LKR</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax:</span>{" "}
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
            <div className="space-y-3 mt-6">
              {paymentMethods
                .filter((_, index) => {
                  if (index === 3 && !order?.bookingId) return false;
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

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-[48%]"
              >
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

