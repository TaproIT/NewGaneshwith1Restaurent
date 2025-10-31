import CurrencyConverter from "@/component/admin/CurrencyConverter";
import React from "react";

const CurrencyConfig: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-y-auto flex flex-col">
        <div className="font-medium text-gray">Currency Configure</div>
        <div className="flex justify-center items-center">
            <CurrencyConverter />
        </div>
    </div>
  )
};

export default CurrencyConfig;
