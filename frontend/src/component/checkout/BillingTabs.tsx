import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/booking";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";
import { api } from "@/api/axios";

interface OrganizedRoom {
  roomNo: string | number;
  nights: number;
  perDayPrice: number;
  currency: string;
  finalPrice: number;
  displayPrice: string;
  lkrRate: number | null;
}

interface OrganizedOrder {
  date: string;
  type: string;
  total: number;
  displayTotal: string;
}

interface Props {
  booking: Booking;
  onDetailsReady?: (details: {
    rooms: OrganizedRoom[];
    groupedOrders: OrganizedOrder[];
  }) => void;
}

const BillingTabs: React.FC<Props> = ({ booking, onDetailsReady }) => {
  const [activeTab, setActiveTab] =
    useState<"summary" | "details">("summary");
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
        console.error("Failed to fetch currency values:", error);
      }
    };

    fetchRates();
  }, []);

  const getLkrRate = (cur: string) => {
    if (cur === "USD") return usd ?? null;
    if (cur === "EUR") return eur ?? null;
    return null;
  };

  // -----------------------------
  // ORGANIZE DATA & SEND TO PARENT
  // -----------------------------
  useEffect(() => {
    if (!booking) return;

    // --------- ORGANIZE ROOMS ---------
    const roomDetails: OrganizedRoom[] =
      booking.roomDetails?.map((room) => ({
        roomNo: room.roomNo,
        nights: room.nights,
        perDayPrice: room.perDayPrice,
        currency: room.currency,
        finalPrice: room.finalRoomTotalPrice,
        displayPrice: convertAndFormatPrice(
          room.finalRoomTotalPrice,
          rates,
          displayCurrency
        ),
        lkrRate: getLkrRate(room.currency),
      })) || [];

    // --------- GROUP ORDERS BY DATE + TYPE ---------
    const grouped: Record<
      string,
      { date: string; type: string; total: number }
    > = {};

    booking.orderDetails?.forEach((order) => {
      const date = order.updatedAt.split("T")[0];
      const key = `${date}-${order.restaurantType}`;

      if (!grouped[key]) {
        grouped[key] = {
          date,
          type: order.restaurantType,
          total: 0,
        };
      }

      grouped[key].total += order.totalBill;
    });

    const groupedOrders: OrganizedOrder[] = Object.values(grouped).map((item) => ({
      ...item,
      displayTotal: convertAndFormatPrice(
        item.total,
        rates,
        displayCurrency
      ),
    }));

    // SEND TO PARENT
    onDetailsReady?.({
      rooms: roomDetails,
      groupedOrders,
    });
  }, [booking, rates, displayCurrency, usd, eur]);

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

      {/* ================= SUMMARY TAB ================= */}
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

      {/* ================= DETAILS TAB ================= */}
      {activeTab === "details" && (
        <div className="space-y-4 text-sm h-40 overflow-y-auto">
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
                        ({room.nights} nights × {room.perDayPrice}{" "}
                        {room.currency}
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
              <div className="text-gray-500 italic">
                No rooms available
              </div>
            )}
          </div>

          {/* ORDER DETAILS */}
          <div>
            <div className="font-medium mb-2">Orders</div>
            {booking.orderDetails?.length ? (
              (() => {
                // GROUP LOGIC ALREADY DONE IN USEEFFECT
                const grouped: Record<
                  string,
                  { date: string; type: string; total: number }
                > = {};

                booking.orderDetails.forEach((order) => {
                  const date = order.updatedAt.split("T")[0];
                  const key = `${date}-${order.restaurantType}`;

                  if (!grouped[key]) {
                    grouped[key] = {
                      date,
                      type: order.restaurantType,
                      total: 0,
                    };
                  }

                  grouped[key].total += order.totalBill;
                });

                return Object.values(grouped).map((item, index) => (
                  <div key={index} className="flex flex-col mb-1">
                    <div>{item.date}</div>
                    <div className="flex justify-between">
                      <span>{item.type}</span>
                      <span>
                        {convertAndFormatPrice(
                          item.total,
                          rates,
                          displayCurrency
                        )}
                      </span>
                    </div>
                  </div>
                ));
              })()
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
