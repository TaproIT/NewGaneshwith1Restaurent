import StatGridSkeleton from "@/component/skeleton/StatGridSkeleton";
import React, { useEffect, useState } from "react";
import TotalOrders from "./TotalOrders";
import TotalCustomers from "./TotalCustomers";
import SoldLiqueurAmount from "./SoldLiqueurAmount";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import type { DateRange } from "@/types/DateRange";

const PoolResturantDashboard = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [orderSummary, setOrderSummary] = useState<any>(null);
    const [range, setRange] = useState<DateRange | null>(null);

    useEffect(() => {
        const fetchOrderSummary = async () => {
          try {
            const response = await api.get(
              "/order/order-summary"
            );
            setOrderSummary(response.data.data.summaryByRestaurantType.Pool);
            setRange(response.data.data.dateRange);
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
          {range && <TotalOrders summary={orderSummary.orderSummary} range={range} />}
          {range && <TotalCustomers summary={orderSummary.customerSummary} range={range} />}
          <SoldLiqueurAmount />
        </div>
      )}
    </div>
  )
};

export default PoolResturantDashboard;
