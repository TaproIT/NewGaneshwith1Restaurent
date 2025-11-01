import type { CustomerStats } from "@/types/CustomerStats";
import type { DateRange } from "@/types/DateRange";
import { Users2 } from "lucide-react";
import React from "react";

interface Props {
  summary: CustomerStats;
  range: DateRange;
}

const TotalCustomers: React.FC<Props> = ({ summary, range }) => {
  // Normalize data: ensure both "Checked-In" and "Walk-In" exist
  const checkedInCount =
    summary?.byCustomerType.find(
      (t) => t.customerType.toLowerCase() === "checked-in"
    )?.count ?? 0;

  const walkInCount =
    summary?.byCustomerType.find(
      (t) => t.customerType.toLowerCase() === "walk-in"
    )?.count ?? 0;

    const formatDate = (dateString: string): string => {
  // Extract date part before the comma
  const datePart = dateString.split(",")[0];
  const date = new Date(datePart);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });

  // Add ordinal suffix (st, nd, rd, th)
  const getOrdinalSuffix = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${day.toString().padStart(2, "0")}${getOrdinalSuffix(day)} ${month}`;
};


    const fromDate = formatDate(range.from);
    const toDate = formatDate(range.to);

  return (
    <div className="p-4 bg-mainWhite rounded-2xl flex gap-4 flex-col">
      {/* Top section */}
      <div className="flex justify-between">
        <div className="p-4 rounded-2xl bg-[#F2F4F7] flex justify-center items-center text-center">
          <Users2 color="#1D2939" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-Primary_blue font-medium text-[16px]">
            Total Customers Arrived
          </div>
          <div className="text-Primary_orange font-bold text-2xl text-right">
            {summary?.totalCustomers}
          </div>
        </div>
      </div>

      {/* Breakdown section */}
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium text-[#6F6868] pb-2">{fromDate} - {toDate}</div>
        <div className="grid grid-cols-4 text-[#6F6868] text-[14px] font-medium">
          <div className="col-span-2">Checked-In</div>
          <div className="col-span-1 text-center">:</div>
          <div className="col-span-1">{checkedInCount}</div>
        </div>

        <div className="grid grid-cols-4 text-[#6F6868] text-[14px] font-medium">
          <div className="col-span-2">Walk-In</div>
          <div className="col-span-1 text-center">:</div>
          <div className="col-span-1">{walkInCount}</div>
        </div>
      </div>
    </div>
  );
};

export default TotalCustomers;
