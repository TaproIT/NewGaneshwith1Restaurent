import type { BeverageItem } from "@/types/BeverageItem";
import { Plus } from "lucide-react";
import React from "react";

interface InventoryItemsProps {
  onOpenModal: () => void;
  beverages: BeverageItem[];
  category: string;
}

const InventoryItems: React.FC<InventoryItemsProps> = ({
  onOpenModal,
  beverages,
  category,
}) => {
  // filter by category before mapping
  const filteredBeverages = beverages.filter(
    (b) => b.category === category
  );

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
          className="col-span-1 rounded-lg flex flex-col border-2 border-[#CECECE] gap-1 p-1"
        >
          <div className="bg-bg flex flex-col p-2 justify-center items-center">
            <div className="font-medium text-sm text-center">
              {bev.beverageName}
            </div>
            {/* optional size (not in type, just example if name contains ml) */}
            <div className="font-medium text-[10px] text-center text-gray">
              375 ml
            </div>
            <div className="font-medium text-[10px] text-center text-[#B24E0E]">
              {bev.currentMonthAvailable} In Stock
            </div>
          </div>
          <div className="bg-bg flex gap-5 p-1 justify-center items-center">
            <div className="text-sm font-medium text-primary">
              LKR {bev.price.toFixed(2)}
            </div>
            {/* <Button size="sm">
              <Plus />
            </Button> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryItems;
