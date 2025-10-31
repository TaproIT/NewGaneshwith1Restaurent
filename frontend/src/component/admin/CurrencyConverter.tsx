import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import usdFlag from "@/assets/Images/usd.webp";
import lkrFlag from "@/assets/Images/lkr.webp";

const CurrencyConverter = () => {
  const [lkrValue, setLkrValue] = useState<string>("");

  // handle numeric/float input
  const handleLkrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid float number
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setLkrValue(value);
    }
  };

  return (
    <div className="flex flex-col gap-10 items-center justify-center mt-10">
      <div className="flex flex-col py-15 px-12 bg-Ash rounded-lg justify-center items-center gap-15">
        <div className="flex justify-between gap-10 items-center">
          {/* LKR Input */}
          <div className="flex gap-2 items-center">
            <img src={lkrFlag} alt="lkrFlag" className="w-8 h-8 rounded-full object-cover" />
            <div>LKR</div>
            <Input
              value={lkrValue}
              onChange={handleLkrChange}
              className="border-black w-28"
              placeholder="0.00"
            />
          </div>

          <ArrowRightLeft className="rounded-full bg-Primary_blue h-7 w-7 p-1 text-white" />

          {/* USD Fixed Input */}
          <div className="flex gap-2 items-center">
            <img src={usdFlag} alt="usdFlag" className="w-8 h-8 rounded-full object-cover" />
            <div>USD</div>
            <Input
              value={1}
              readOnly
              className="border-black w-28 cursor-not-allowed"
            />
          </div>
        </div>

        <Button className="bg-Primary_blue text-white w-50">
          Save Exchange Rate
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="font-medium">Indicative Exchange Rate</div>
        <div className="p-4 border border-Ash rounded-lg text-Primary_blue font-medium">
          1 USD = 290.50 LKR
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
