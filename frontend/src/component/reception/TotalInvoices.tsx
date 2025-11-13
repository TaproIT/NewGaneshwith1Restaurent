import type { MonthlyReport } from "@/types/monthlySummary";
import { ReceiptIcon } from "lucide-react";
import React from "react";

interface TotalInvoicesProps {
  monthlySummary?: MonthlyReport | null;
}

const TotalInvoices: React.FC<TotalInvoicesProps> = ({ monthlySummary }) => {
  return (
    <div className="p-4 bg-mainWhite rounded-2xl flex gap-4 flex-col">
      <div className="flex justify-between">
        <div className="p-4 rounded-2xl bg-[#F2F4F7] flex justify-center items-center text-center">
          <ReceiptIcon color="#1D2939" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-Primary_blue font-medium text-[16px]">
            Total Invoices Generated
          </div>
          <div className="text-Primary_orange font-bold text-2xl text-right">
            {monthlySummary?.totalInvoices ?? 0}
          </div>
        </div>
      </div>

      {/* <div className="flex flex-col gap-1">
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Ganesh Garden Beach Cabana</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">100</div>
        </div>
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Marakolliya Beach Resort</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">100</div>
        </div>
      </div> */}
    </div>
  );
};

export default TotalInvoices;
