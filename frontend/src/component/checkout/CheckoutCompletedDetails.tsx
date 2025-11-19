import React, { useEffect, useState } from "react";
import { api } from "@/api/axios";
import CheckoutSkeleton from "../skeleton/CheckoutSkeleton";
import TotalSummary from "./TotalSummary";
import { convertAndFormatPrice } from "@/util/priceConverter";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import type { CompletedBooking } from "@/types/checkoutCompleted";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { printFinalBill } from "@/util/printCheckout";

interface Charge {
  name: string;
  price: number;
}

const CheckoutCompletedDetails: React.FC = () => {
  const [booking, setBooking] = useState<CompletedBooking | null>(null);
  const { state } = useLocation();
  const { id: bookingId } = state || {};


  const { rates } = useRates();
  const { displayCurrency } = useCurrency();

  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");

  useEffect(() => {
    const fetchCheckout = async () => {
      try {
        const res = await api.get(`/booking/completed/${bookingId}`);
        setBooking(res.data.data);
      } catch (error) {
        console.error("Error fetching completed booking:", error);
      }
    };

    if (bookingId) fetchCheckout();
  }, [bookingId]);

  useEffect(() => {
      // Dynamically load QZ Tray
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
      script.onload = () => console.log("QZ Tray script loaded");
      document.body.appendChild(script);
    }, []);

  if (!booking) return <CheckoutSkeleton />;

  const subtotal = booking.subtotal;
  const tax = 0;
  const discount = booking.discount || 0;
  const total = booking.totalBill || 0;
  const serviceCharge = booking.serviceCharge || 0

  // -----------------------------
  // Additional Charges (Read-only)
  // -----------------------------
  // Read values
const spaCharge = booking.spa || 0;
const laundryCharge = booking.laundary || 0;
const miniBarCharge = booking.miniBar || 0;
const extraItems = booking.additionalPriceItems || [];

// Merge into one array
const additionalCharges: Charge[] = [
  ...(spaCharge ? [{ name: "Spa", price: spaCharge }] : []),
  ...(laundryCharge ? [{ name: "Laundry", price: laundryCharge }] : []),
  ...(miniBarCharge ? [{ name: "Mini Bar", price: miniBarCharge }] : []),
  ...extraItems,      // <-- required to show items from API
];

  // -----------------------------
  // Group orders by date + type for Detail Bill
  // -----------------------------
  const groupedOrders = (() => {
    const grouped: Record<string, { date: string; type: string; total: number }> = {};
    booking.orderDetails?.forEach((order) => {
      const date = order.updatedAt.split("T")[0];
      const key = `${date}-${order.restaurantType}`;
      if (!grouped[key]) grouped[key] = { date, type: order.restaurantType, total: 0 };
      grouped[key].total += order.totalBill;
    });
    return Object.values(grouped);
  })();

const totalBill = total;
const additionalPrice = additionalCharges;
const totalRoomCharge = booking.finalAllRoomsTotalPrice;
const totalOrdersPrice = booking.totalOrdersBill;

const spa = booking.spa || 0;
const miniBar = booking.miniBar || 0;
const laundary = booking.laundary || 0;

// If API gives payment method
const selectedPayment = booking.paymentMethod || "N/A";

// Detail sections
const detailRooms = booking.roomsHistory || [];
const detailOrders = groupedOrders;

// Print function
const handlePrint = () => {
  printFinalBill({
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
    spa,
    miniBar,
    laundary,
    detailRooms,
    detailOrders,
    convertAndFormatPrice
  });
};

console.log(booking)

  return (
    <div className="h-[calc(100vh-140px)] bg-white p-4 overflow-y-auto">
      <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT SIDE: Checkout Info + Billing Tabs */}
        <div className="bg-mainWhite rounded-2xl shadow-sm p-6 flex flex-col justify-between text-sm">
          <div className="space-y-4">

            {/* BOOKING INFO */}
            <div>
              <h2 className="font-semibold text-xl mb-4 text-center">Checkout Details</h2>

              <div className="text-sm text-gray-600 space-y-2 my-2">
                <div className="flex justify-between">
                  <span>Booking ID</span>
                  <span>{booking.uniqueBookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guest Name</span>
                  <span>{booking.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hotel</span>
                  <span>{booking.hotel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Breakfast</span>
                  <span>{booking.breakfast}</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking Type</span>
                  <span>{booking.customerType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Checked In</span>
                  <span>{booking.checkIn.split("T")[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Checked Out</span>
                  <span>{booking.checkOut.split("T")[0]}</span>
                </div>
              </div>
            </div>

            {/* Billing Tabs */}
            <div>
              <div className="flex justify-center space-x-3 mb-4">
                <Button
                  variant={activeTab === "summary" ? "default" : "outline"}
                  onClick={() => setActiveTab("summary")}
                >
                  Summary Bill
                </Button>
                <Button
                  variant={activeTab === "details" ? "default" : "outline"}
                  onClick={() => setActiveTab("details")}
                >
                  Detail Bill
                </Button>
              </div>

              {/* ================= SUMMARY TAB ================= */}
              {activeTab === "summary" && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Room Charges</span>
                    <span>{convertAndFormatPrice(booking.finalAllRoomsTotalPrice, rates, displayCurrency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Orders</span>
                    <span>{convertAndFormatPrice(booking.totalOrdersBill, rates, displayCurrency)}</span>
                  </div>
                </div>
              )}

              {/* ================= DETAILS TAB ================= */}
              {activeTab === "details" && (
                <div className="space-y-4 text-sm h-40 overflow-y-auto">

                  {/* ROOM DETAILS */}
                  <div>
                    <div className="font-medium mb-2">Rooms</div>
                    {booking.roomsHistory?.length ? (
                      booking.roomsHistory.map((room) => (
                        <div key={room._id} className="flex justify-between mb-1">
                          <span>
                            Room {room.roomNo} ({room.night} nights × {room.perDayPrice} {room.currency})
                          </span>
                          <span>{convertAndFormatPrice(room.finalRoomTotalPrice, rates, displayCurrency)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic">No rooms available</div>
                    )}
                  </div>

                  {/* ORDER DETAILS */}
                  <div>
                    <div className="font-medium mb-2">Orders</div>
                    {groupedOrders.length ? (
                      groupedOrders.map((order, i) => (
                        <div key={i} className="flex flex-col mb-1">
                          <div>{order.date}</div>
                          <div className="flex justify-between">
                            <span>{order.type}</span>
                            <span>{convertAndFormatPrice(order.total, rates, displayCurrency)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic">No orders available</div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Additional Charges + Total Summary */}
        <div className="bg-mainWhite rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4">
          
          {/* Additional Charges */}
          <div>
            <div className="font-medium mb-2">Additional Prices</div>
            {additionalCharges.length ? (
              additionalCharges.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b pb-1 text-sm"
                >
                  <span>{c.name}</span>
                  <span>{convertAndFormatPrice(c.price, rates, displayCurrency)}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">No additional charges</div>
            )}
          </div>

          <TotalSummary
            subtotal={subtotal}
            tax={tax}
            serviceCharge={serviceCharge}
            discount={discount}
            total={total}
          />

          <Button onClick={handlePrint}>Print</Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCompletedDetails;
