import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import type { BeverageItem } from "@/types/BeverageItem";
import { convertAndFormatPrice } from "@/util/priceConverter";
import { Plus } from "lucide-react";
import React, { useState } from "react";

interface InventoryItemsProps {
  onOpenModal: () => void;
  beverages: BeverageItem[];
  category: string;
  onSelectBeverage: (id: string) => void; // 👈 new prop
}

const InventoryItems: React.FC<InventoryItemsProps> = ({
  onOpenModal,
  beverages,
  category,
  onSelectBeverage,
}) => {
  // filter by category before mapping
  const filteredBeverages = beverages.filter(
    (b) => b.category === category
  );

  const [selectedBeverage, setSelectedBeverage] = useState("");
  const { rates } = useRates();
  const { displayCurrency } = useCurrency();

  const handleSelect = (id: string) => {
    setSelectedBeverage(id);
    onSelectBeverage(id);
  };

  return (
    <div className="grid grid-cols-4 gap-2 pb-4 overflow-y-auto">
      {/* Add button */}
      <div
        className="col-span-1 rounded-lg flex justify-center items-center border-2 border-[#CECECE] cursor-pointer"
        onClick={onOpenModal}
      >
        <Plus className="text-primary" />
      </div>

      {/* Map beverages */}
      {filteredBeverages.map((bev) => (
        <div
          key={bev._id}
          className={`col-span-1 rounded-lg flex flex-col border-2 gap-1 p-1 cursor-pointer ${
            selectedBeverage === bev._id
              ? "border-primary"
              : "border-[#CECECE]"
          }`}
          onClick={() => handleSelect(bev._id)}
        >
          <div className="bg-bg flex flex-col p-2 justify-center items-center">
            <div className="font-medium text-sm text-center">
              {bev.beverageName}
            </div>
            <div className="font-medium text-[10px] text-center text-gray">
              {bev.volume || 0} ml
            </div>
            <div className="font-medium text-[10px] text-center text-[#B24E0E]">
              {bev.runningStock} In Stock
            </div>
          </div>
          <div className="bg-bg flex gap-5 p-1 justify-center items-center">
            <div className="text-sm font-medium text-primary">
              {convertAndFormatPrice(bev.price, rates, displayCurrency)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryItems;
