import React, { useEffect, useState } from "react";
import StatGridSkeleton from "../skeleton/StatGridSkeleton";
import TotalGuests from "./TotalGuests";
import TotalAvailableRooms from "./TotalAvailableRooms";
import TotalInvoices from "./TotalInvoices";
import MonthlyGuestRegistration from "./MonthlyGuestRegistration";
import { api } from "@/api/axios";
import type { MonthlyReport } from "@/types/monthlySummary";
import { toast } from "react-toastify";
import type { HotelMonthlyStats } from "@/types/hotelMonthlyStats";

const ReceptionDashboard: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [monthlySummary, setMonthlySummary] = useState<MonthlyReport | null>(null);
    const [monthlyGuestsSummary, setMonthlyGuestsSummary] = useState<HotelMonthlyStats[] | null>(null);

    useEffect(() => {
            const MonthlySummary = async () => {
              try {
                const response = await api.get(
                  "/hotel-dashboard/monthly-summary"
                );
                const res = await api.get(
                  "/hotel-dashboard/monthly-guests"
                );
                setMonthlySummary(response.data);
                setMonthlyGuestsSummary(res.data);
                setLoading(false);
              } catch (error) {
                toast.error("Error fetching monthly summary");
                setLoading(false);
              }
            };
        
            MonthlySummary();
          }, []);
  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <StatGridSkeleton />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          <TotalGuests monthlySummary={monthlySummary} />
          <TotalAvailableRooms monthlySummary={monthlySummary} />
          <TotalInvoices monthlySummary={monthlySummary} />
        </div>
      )}

      <MonthlyGuestRegistration monthlyGuestsSummary={monthlyGuestsSummary} />
    </div>
  )
};

export default ReceptionDashboard;
