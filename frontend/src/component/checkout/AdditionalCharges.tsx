import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";

interface Charge {
  name: string;
  price: number; // stored internally in LKR
}

interface Props {
  charges: Charge[];
  setCharges: React.Dispatch<React.SetStateAction<Charge[]>>;
}

const AdditionalCharges: React.FC<Props> = ({ charges, setCharges }) => {
  const { displayCurrency } = useCurrency();
  const { rates, loading } = useRates();

  const [newCharge, setNewCharge] = useState({ name: "", price: "" });

  const handleAdd = () => {
    if (!newCharge.name || !newCharge.price) return;
    const numericValue = Number(newCharge.price);

    // Convert to LKR before saving internally
    let priceInLKR = numericValue;
    if (displayCurrency === "USD" && rates?.["LKR_USD"]) {
      priceInLKR = numericValue / rates["LKR_USD"];
    }

    setCharges([...charges, { name: newCharge.name, price: priceInLKR }]);
    setNewCharge({ name: "", price: "" });
  };

  const handleRemove = (index: number) => {
    setCharges(charges.filter((_, i) => i !== index));
  };

  const getDisplayPrice = (priceInLKR: number): string => {
    if (loading) return "...";
    return convertAndFormatPrice(priceInLKR, rates, displayCurrency);
  };

  return (
    <>
      <div className="font-medium mb-2">Additional Prices</div>

      {/* Input fields */}
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="text"
          placeholder="Name"
          value={newCharge.name}
          onChange={(e) => setNewCharge({ ...newCharge, name: e.target.value })}
          className="border px-2 py-1 rounded text-sm"
        />
        <input
          type="number"
          placeholder={`Price (${displayCurrency})`}
          value={newCharge.price}
          onChange={(e) => setNewCharge({ ...newCharge, price: e.target.value })}
          className="border px-2 py-1 rounded text-right text-sm"
        />
        <Button size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {/* List of added charges */}
      {charges.map((c, i) => (
        <div
          key={i}
          className="flex justify-between items-center border-b pb-1 text-sm"
        >
          <span>{c.name}</span>
          <div className="flex items-center space-x-2">
            <span>{getDisplayPrice(c.price)}</span>
            <button
              onClick={() => handleRemove(i)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default AdditionalCharges;
