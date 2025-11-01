import type { DateRange } from "@/types/DateRange";
import type { OrderStats } from "@/types/OrderStats";
import { BookCheck } from "lucide-react";
import React from "react";

interface Props {
  summary: OrderStats;
  range: DateRange;
}

const TotalOrders: React.FC<Props> = ({ summary, range }) => {

    const dineInCount =
    summary?.byServiceType.find(
      (t) => t.serviceType.toLowerCase() === "dine-in"
    )?.count ?? 0;

  const takeAwayCount =
    summary?.byServiceType.find(
      (t) => t.serviceType.toLowerCase() === "take-away"
    )?.count ?? 0;

  const roomServiceCount =
    summary?.byServiceType.find(
      (t) => t.serviceType.toLowerCase() === "save-to-room"
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
      <div className="flex justify-between">
        <div className="p-4 rounded-2xl bg-[#F2F4F7] flex justify-center items-center text-center">
          <BookCheck color="#1D2939" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-Primary_blue font-medium text-[16px]">Total Orders</div>
          <div className="text-Primary_orange font-bold text-2xl text-right">{summary?.totalOrders}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium text-[#6F6868] pb-2">{fromDate} - {toDate}</div>
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Dine-In</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">{dineInCount}</div>
        </div>
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Take-Away</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">{takeAwayCount}</div>
        </div>
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Room-Service</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">{roomServiceCount}</div>
        </div>
      </div>
    </div>
  )
};

export default TotalOrders;
