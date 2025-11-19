import type { DateRange } from "@/types/DateRange";
import { BottleWine } from "lucide-react";
import React from "react";

interface Props {
  summary: {
    hardLiquorTotal: number;
    softDrinkTotal: number;
  };
  range: DateRange;
}

const SoldLiqueurAmount: React.FC<Props> = ({ summary, range }) => {
  const { hardLiquorTotal, softDrinkTotal } = summary;

  const total = hardLiquorTotal + softDrinkTotal;

  const formatDate = (dateString: string): string => {
    const datePart = dateString.split(",")[0];
    const date = new Date(datePart);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });

    const getOrdinalSuffix = (n: number) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day.toString().padStart(2, "0")}${getOrdinalSuffix(
      day
    )} ${month}`;
  };

  const fromDate = formatDate(range.from);
  const toDate = formatDate(range.to);

  return (
    <div className="p-4 bg-mainWhite rounded-2xl flex gap-4 flex-col">
      <div className="flex justify-between">
        <div className="p-4 rounded-2xl bg-[#F2F4F7] flex justify-center items-center text-center">
          <BottleWine color="#1D2939" />
        </div>

        <div className="flex flex-col gap-2 text-right">
          <div className="text-Primary_blue font-medium text-[16px]">
            Sold Liqueur Amount
          </div>

          {/* Total (hard + soft) */}
          <div className="text-Primary_orange font-bold text-2xl">{total}</div>
        </div>
      </div>

      {/* Item breakdown */}
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium text-[#6F6868] pb-2">
          {fromDate} - {toDate}
        </div>
        <div className="grid grid-cols-4 text-[#6F6868] text-[14px] font-medium">
          <div className="col-span-2">Soft Drinks</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">{softDrinkTotal}</div>
        </div>

        <div className="grid grid-cols-4 text-[#6F6868] text-[14px] font-medium">
          <div className="col-span-2">Hard Liquor</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">{hardLiquorTotal}</div>
        </div>
      </div>
    </div>
  );
};

export default SoldLiqueurAmount;
