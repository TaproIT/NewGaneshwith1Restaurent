import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import usdFlag from "@/assets/Images/usd.webp";
import lkrFlag from "@/assets/Images/lkr.webp";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

const CurrencyConverter = () => {
  const [lkrValue, setLkrValue] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [exchangeRateId, setExchangeRateId] = useState<string>("");

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await api.get("/currency-values"); // replace with your GET API
        if (response.data.data.length > 0) {
          const rate = response.data.data[0];
          setExchangeRate(rate.lkr);
          setLkrValue(rate.lkr.toString());
          setExchangeRateId(rate._id); // store ID for PUT
          console.log(rate._id)
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        toast.error("Failed to fetch exchange rate");
      }
    };
    fetchExchangeRate();
  }, []);

  // Handle numeric/float input
  const handleLkrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setLkrValue(value);
    }
  };

  // Save updated exchange rate
  const handleSave = async () => {
    if (!lkrValue) {
      toast.error("Please enter a valid LKR value");
      return;
    }

    try {
      await api.put(`/currency-values/${exchangeRateId}`, {
        lkr: parseFloat(lkrValue),
        usd: 1, // or your USD value
      });
      setExchangeRate(parseFloat(lkrValue));
      toast.success("Exchange rate updated successfully!");
    } catch (error) {
      console.error("Failed to update exchange rate:", error);
      toast.error("Failed to update exchange rate");
    }
  };

  return (
    <div className="flex flex-col gap-10 items-center justify-center mt-10">
      <div className="flex flex-col py-15 px-12 bg-Ash rounded-lg justify-center items-center gap-15">
        <div className="flex justify-between gap-10 items-center">
          {/* LKR Input */}
          <div className="flex gap-2 items-center">
            <img
              src={lkrFlag}
              alt="lkrFlag"
              className="w-8 h-8 rounded-full object-cover"
            />
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
            <img
              src={usdFlag}
              alt="usdFlag"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>USD</div>
            <Input
              value={1}
              readOnly
              className="border-black w-28 cursor-not-allowed"
            />
          </div>
        </div>

        <Button className="bg-Primary_blue text-white w-50" onClick={handleSave}>
          Save Exchange Rate
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="font-medium">Indicative Exchange Rate</div>
        <div className="p-4 border border-Ash rounded-lg text-Primary_blue font-medium">
          1 USD = {exchangeRate} LKR
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
