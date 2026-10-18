import { api } from "@/api/axios";
import StatGridSkeleton from "@/component/skeleton/StatGridSkeleton";
import type { DateRange } from "@/types/DateRange";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TotalOrders from "./TotalOrders";
import TotalCustomers from "./TotalCustomers";
import SoldLiqueurAmount from "./SoldLiqueurAmount";

// Month-to-date orders, customers and drinks sold for the hotel's one restaurant.
const RestaurantDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [range, setRange] = useState<DateRange | null>(null);
  const [beverageSummary, setBeverageSummary] = useState<any>(null);

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        const response = await api.get("/order/order-summary");

        const summary = response.data.data.summary;
        const range = response.data.data.dateRange;

        setOrderSummary(summary);
        setRange(range);

        const startDate = range.from.split(",")[0];
        const endDate = range.to.split(",")[0];

        const res = await api.get(
          `/order/beverage/sold-summary?startDate=${startDate}&endDate=${endDate}`
        );

        setBeverageSummary(res.data.data.summary);

        setLoading(false);
      } catch (error) {
        toast.error("Error fetching order summary");
        setLoading(false);
      }
    };

    fetchOrderSummary();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <StatGridSkeleton />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {range && (
            <TotalOrders summary={orderSummary?.orderSummary} range={range} />
          )}
          {range && (
            <TotalCustomers
              summary={orderSummary?.customerSummary}
              range={range}
            />
          )}
          {range && (
            <SoldLiqueurAmount
              summary={{
                hardLiquorTotal: beverageSummary?.hardLiquorTotal || 0,
                softDrinkTotal: beverageSummary?.softDrinkTotal || 0,
              }}
              range={range}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
