import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/booking";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";

interface Props {
  booking: Booking;
}

const BillingTabs: React.FC<Props> = ({ booking }) => {
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");

  const { rates } = useRates();
  const { displayCurrency } = useCurrency();

  const displayTotalRoomCharges = convertAndFormatPrice(
    booking.totalRoomsCharges,
    rates,
    displayCurrency
  );

  const displayTotalOrders = convertAndFormatPrice(
    booking.totalOrdersBill,
    rates,
    displayCurrency
  );

  return (
    <>
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

      {activeTab === "summary" && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Room Charges</span>
            <span>{displayTotalRoomCharges}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Orders</span>
            <span>{displayTotalOrders}</span>
          </div>
        </div>
      )}

      {activeTab === "details" && (
        <div className="space-y-4 text-sm">
          <div>
            <div className="font-medium mb-2">Rooms</div>
            {booking.roomDetails && booking.roomDetails.length > 0 ? (
              booking.roomDetails.map((room) => (
                <div key={room.roomId} className="flex justify-between">
                  <span>
                    Room {room.roomNo} ({room.nights} nights)
                  </span>
                  <span>
                    {convertAndFormatPrice(
                      room.finalRoomTotalPrice,
                      rates,
                      displayCurrency
                    )}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">No rooms available</div>
            )}
          </div>

          <div>
            <div className="font-medium mb-2">Orders</div>
            {booking.orderDetails && booking.orderDetails.length > 0 ? (
              booking.orderDetails.map((order) => (
                <div key={order.orderId} className="flex justify-between">
                  <span>Order #{order.orderNumber}</span>
                  <span>
                    {convertAndFormatPrice(
                      order.totalBill,
                      rates,
                      displayCurrency
                    )}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">No orders available</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BillingTabs;
