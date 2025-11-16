import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import usdFlag from "@/assets/Images/usd.webp";
import lkrFlag from "@/assets/Images/lkr.webp";
import euroFlag from "@/assets/Images/euro.png";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

const CurrencyConverter = () => {
  const [usdValue, setUsdValue] = useState<string>(""); // LKR per 1 USD
  const [eurValue, setEurValue] = useState<string>(""); // LKR per 1 EUR
  const [exchangeRateId, setExchangeRateId] = useState<string>("");
  const [loading, setLoading] = useState(false)

  // Fetch rates
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await api.get("/currency-values");
        const data = response.data.data;

        if (data.length > 0) {
          const rate = data[0];
          setUsdValue(rate.usd?.toString() || "");
          setEurValue(rate.eur?.toString() || "");
          setExchangeRateId(rate._id);
        } else {
          toast.info("No exchange rate found — please enter new values.");
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        toast.error("Failed to fetch exchange rates");
      }
    };

    fetchExchangeRate();
  }, []);

  // numeric input restrict
  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleSave = async () => {
    if (!usdValue || !eurValue) {
      toast.error("Please enter both USD and EURO values");
      return;
    }

    const payload = {
      usd: parseFloat(usdValue),
      eur: parseFloat(eurValue),
    };

    setLoading(true)

    try {
      if (exchangeRateId) {
        await api.put(`/currency-values/${exchangeRateId}`, payload);
        toast.success("Exchange rates updated successfully!");
      } else {
        const createResponse = await api.post("/currency-values", payload);
        setExchangeRateId(createResponse.data.data._id);
        toast.success("Exchange rates created successfully!");
      }
    } catch (error) {
      console.error("Failed to save exchange rate:", error);
      toast.error("Failed to save exchange rate");
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="flex flex-col gap-10 items-center justify-center mt-10">
      <div className="flex flex-col py-10 px-12 bg-Ash rounded-lg justify-center items-center gap-15">

        {/* USD Section */}
        <div className="flex justify-between gap-10 items-center">
          <div className="flex gap-2 items-center">
            <img src={lkrFlag} alt="lkrFlag" className="w-8 h-8 rounded-full object-cover" />
            <div>LKR</div>
            <Input
              value={usdValue}
              onChange={(e) => handleNumberInput(e, setUsdValue)}
              className="border-black w-28"
              placeholder="0.00"
            />
          </div>

          <ArrowRightLeft className="rounded-full bg-Primary_blue h-7 w-7 p-1 text-white" />

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

        {/* EURO Section */}
        <div className="flex justify-between gap-10 items-center">
          <div className="flex gap-2 items-center">
            <img src={lkrFlag} alt="lkrFlag" className="w-8 h-8 rounded-full object-cover" />
            <div>LKR</div>
            <Input
              value={eurValue}
              onChange={(e) => handleNumberInput(e, setEurValue)}
              className="border-black w-28"
              placeholder="0.00"
            />
          </div>

          <ArrowRightLeft className="rounded-full bg-Primary_blue h-7 w-7 p-1 text-white" />

          <div className="flex gap-2 items-center">
            <img src={euroFlag} alt="usdFlag" className="w-8 h-8 rounded-full object-cover" />
            <div>EURO</div>
            <Input
              value={1}
              readOnly
              className="border-black w-28 cursor-not-allowed"
            />
          </div>
        </div>

        <Button className="bg-Primary_blue text-white w-50" onClick={handleSave}>
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Update Exchange Rates"}
        </Button>
      </div>

      {(usdValue || eurValue) && (
        <div className="flex flex-col gap-4 justify-center">
          <div className="font-medium text-center">Indicative Exchange Rate</div>
          <div className="flex items-center gap-5">
            <div className="p-4 border border-Ash rounded-lg text-Primary_blue font-medium">
              1 USD = {usdValue || "-"} LKR
            </div>
            <div className="p-4 border border-Ash rounded-lg text-Primary_blue font-medium">
              1 EURO = {eurValue || "-"} LKR
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;