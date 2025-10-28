import React, { useState } from "react";
import StatGridSkeleton from "../skeleton/StatGridSkeleton";
import TotalGuests from "./TotalGuests";
import TotalAvailableRooms from "./TotalAvailableRooms";
import TotalInvoices from "./TotalInvoices";
import MonthlyGuestRegistration from "./MonthlyGuestRegistration";

const ReceptionDashboard = () => {
    const [loading, setLoading] = useState<boolean>(false); // this should be true initially
  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <StatGridSkeleton />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          <TotalGuests />
          <TotalAvailableRooms />
          <TotalInvoices />
        </div>
      )}

      <MonthlyGuestRegistration />
    </div>
  )
};

export default ReceptionDashboard;
