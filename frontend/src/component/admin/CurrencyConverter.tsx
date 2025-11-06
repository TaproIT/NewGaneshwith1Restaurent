import React, { useState, useEffect } from "react";
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
        const response = await api.get("/currency-values");
        const data = response.data.data;

        if (data.length > 0) {
          const rate = data[0];
          setExchangeRate(rate.lkr);
          setLkrValue(rate.lkr.toString());
          setExchangeRateId(rate._id);
        } else {
          toast.info("No exchange rate found — please enter a new value.");
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        toast.error("Failed to fetch exchange rate");
      }
    };

    fetchExchangeRate();
  }, []);

  // Handle numeric input
  const handleLkrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setLkrValue(value);
    }
  };

  // Save or create exchange rate
  const handleSave = async () => {
    if (!lkrValue) {
      toast.error("Please enter a valid LKR value");
      return;
    }

    try {
      if (exchangeRateId) {
        // UPDATE existing exchange rate
        await api.put(`/currency-values/${exchangeRateId}`, {
          lkr: parseFloat(lkrValue),
          usd: 1,
        });
        toast.success("Exchange rate updated successfully!");
      } else {
        // CREATE new exchange rate
        const postResponse = await api.post("/currency-values", {
          lkr: parseFloat(lkrValue),
          usd: 1,
        });
        const createdRate = postResponse.data.data;

        setExchangeRateId(createdRate._id);
        toast.success("Exchange rate created successfully!");
      }

      setExchangeRate(parseFloat(lkrValue));
    } catch (error) {
      console.error("Failed to save exchange rate:", error);
      toast.error("Failed to save exchange rate");
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
          {exchangeRateId ? "Update Exchange Rate" : "Save Exchange Rate"}
        </Button>
      </div>

      {exchangeRate > 0 && (
        <div className="flex flex-col gap-4">
          <div className="font-medium">Indicative Exchange Rate</div>
          <div className="p-4 border border-Ash rounded-lg text-Primary_blue font-medium">
            1 USD = {exchangeRate} LKR
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;