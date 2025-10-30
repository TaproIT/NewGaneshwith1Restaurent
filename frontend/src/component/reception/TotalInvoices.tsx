import { ReceiptIcon } from "lucide-react";
import React from "react";

const TotalInvoices: React.FC = () => {
  return (
    <div className="p-4 bg-mainWhite rounded-2xl flex gap-4 flex-col">
      <div className="flex justify-between">
        <div className="p-4 rounded-2xl bg-[#F2F4F7] flex justify-center items-center text-center">
          <ReceiptIcon color="#1D2939" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-Primary_blue font-medium text-[16px]">Total Guests Registered</div>
          <div className="text-Primary_orange font-bold text-2xl text-right">100</div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Hotel A</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">100</div>
        </div>
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Hotel B</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">100</div>
        </div>
      </div>
    </div>
  )
};

export default TotalInvoices;
