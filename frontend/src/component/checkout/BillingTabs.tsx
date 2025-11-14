import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/booking";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";
import { api } from "@/api/axios";

interface Props {
  booking: Booking;
}

const BillingTabs: React.FC<Props> = ({ booking }) => {
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");
  const [loading, setLoading] = useState(true);
  const [usd, setUsd] = useState<number>();
  const [eur, setEur] = useState<number>();

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

  // Fetch USD/EUR values
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get("/currency-values");
        const data = res.data.data[0];
        setUsd(data.usd);
        setEur(data.eur);
      } catch (error) {
        console.error("Failed to fetch rates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const getLkrRate = (cur: string) => {
    if (cur === "USD") return usd;
    if (cur === "EUR") return eur;
    return null;
  };

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

      {/* SUMMARY TAB */}
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

      {/* DETAILS TAB */}
      {activeTab === "details" && (
        <div className="space-y-4 text-sm">
          {/* ROOM DETAILS */}
          <div>
            <div className="font-medium mb-2">Rooms</div>

            {booking.roomDetails?.length ? (
              booking.roomDetails.map((room) => {
                const lkrRate = getLkrRate(room.currency);

                return (
                  <div key={room.roomId} className="flex justify-between gap-2">
                    <div className="flex flex-col">
                      <span>Room {room.roomNo}</span>

                      <div className="mb-2">
                        ({room.nights} nights × {room.perDayPrice} {room.currency}
                        {lkrRate && (
                          <>
                            {" × "} {lkrRate} LKR
                          </>
                        )}
                        )
                      </div>
                    </div>

                    <span>
                      {convertAndFormatPrice(
                        room.finalRoomTotalPrice,
                        rates,
                        displayCurrency
                      )}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 italic">No rooms available</div>
            )}
          </div>

          {/* ORDER DETAILS */}
          <div>
            <div className="font-medium mb-2">Orders</div>

            {booking.orderDetails?.length ? (
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
