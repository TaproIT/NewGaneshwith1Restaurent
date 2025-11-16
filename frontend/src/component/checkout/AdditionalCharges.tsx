import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";

interface Charge {
  name: string;
  price: number;
}

interface Props {
  charges: Charge[];
  setCharges: React.Dispatch<React.SetStateAction<Charge[]>>;

  spa: number;
  setSpa: React.Dispatch<React.SetStateAction<number>>;

  laundry: number;
  setLaundry: React.Dispatch<React.SetStateAction<number>>;

  miniBar: number;
  setMiniBar: React.Dispatch<React.SetStateAction<number>>;
}

const AdditionalCharges: React.FC<Props> = ({
  charges,
  setCharges,
  spa,
  setSpa,
  laundry,
  setLaundry,
  miniBar,
  setMiniBar,
}) => {
  const { displayCurrency } = useCurrency();
  const { rates, loading } = useRates();

  const [newCharge, setNewCharge] = useState({ name: "", price: "" });

  const convertToLKR = (value: number) => {
    if (displayCurrency === "USD" && rates?.["LKR_USD"]) {
      return value / rates["LKR_USD"];
    }
    return value;
  };

  // --- Add a custom charge to the array ---
  const handleAdd = () => {
    if (!newCharge.name || !newCharge.price) return;
    const priceInLKR = convertToLKR(Number(newCharge.price));

    setCharges([...charges, { name: newCharge.name, price: priceInLKR }]);
    setNewCharge({ name: "", price: "" });
  };

  // --- Remove a custom charge from the array ---
  const handleRemove = (index: number) => {
    setCharges(charges.filter((_, i) => i !== index));
  };

  const getDisplayPrice = (priceInLKR: number) => {
    if (loading) return "...";
    return convertAndFormatPrice(priceInLKR, rates, displayCurrency);
  };

  return (
    <>
      <div className="font-medium mb-2">Additional Prices</div>

      {/* --- SPA --- */}
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="text"
          value="Spa"
          disabled
          className="border px-2 py-1 rounded text-sm bg-gray-100 w-32"
        />
        <input
          type="number"
          placeholder={`Price (${displayCurrency})`}
          value={spa}
          onChange={(e) => setSpa(Number(e.target.value))}
          className="border px-2 py-1 rounded text-right text-sm flex-1"
        />
      </div>

      {/* --- LAUNDRY --- */}
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="text"
          value="Laundry"
          disabled
          className="border px-2 py-1 rounded text-sm bg-gray-100 w-32"
        />
        <input
          type="number"
          placeholder={`Price (${displayCurrency})`}
          value={laundry}
          onChange={(e) => setLaundry(Number(e.target.value))}
          className="border px-2 py-1 rounded text-right text-sm flex-1"
        />
      </div>

      {/* --- MINI BAR --- */}
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="text"
          value="Mini Bar"
          disabled
          className="border px-2 py-1 rounded text-sm bg-gray-100 w-32"
        />
        <input
          type="number"
          placeholder={`Price (${displayCurrency})`}
          value={miniBar}
          onChange={(e) => setMiniBar(Number(e.target.value))}
          className="border px-2 py-1 rounded text-right text-sm flex-1"
        />
      </div>

      {/* --- CUSTOM ADDITIONAL CHARGES --- */}
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="text"
          placeholder="Name"
          value={newCharge.name}
          onChange={(e) =>
            setNewCharge({ ...newCharge, name: e.target.value })
          }
          className="border px-2 py-1 rounded text-sm w-32"
        />

        <input
          type="number"
          placeholder={`Price (${displayCurrency})`}
          value={newCharge.price}
          onChange={(e) =>
            setNewCharge({ ...newCharge, price: e.target.value })
          }
          className="border px-2 py-1 rounded text-right text-sm flex-1"
        />

        <Button size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {/* --- LIST OF CUSTOM CHARGES --- */}
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
