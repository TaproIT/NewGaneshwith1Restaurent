import { api } from "@/api/axios";
import AddBeverageModal from "@/component/beverage-inventory/manage-inventory/AddBeverageModal";
import AddItem from "@/component/beverage-inventory/manage-inventory/AddItem";
import InventoryItems from "@/component/beverage-inventory/manage-inventory/InventoryItems";
import InventoryItemsSkeleton from "@/component/skeleton/InventoryItemsSkeleton";
import { Button } from "@/components/ui/button";
import type { BeverageItem } from "@/types/BeverageItem";
import React, { useEffect, useState } from "react";

const ManageInventory: React.FC = () => {
  const [active, setActive] = useState<string>("soft drinks"); // track active category
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [beverages, setBeverages] = useState<BeverageItem[]>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchBeverage = async () => {
    try {
      const response = await api.get("/beverages");
      setBeverages(response.data.data);
      setLoading(false);
    } catch (error: unknown) {
      console.error("Fetch beverages error:", error);
      setLoading(false);
    }
  };

  fetchBeverage();
}, [active, isModalOpen]);


  const handleClick = (category: string) => {
    setActive(category);
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-4 gap-5">
        <div className="col-span-3 bg-mainWhite p-4 rounded-2xl">
          <div className="flex gap-4 mb-4">
            <Button
              size="lg"
              variant="outline"
              className={`hover:bg-secondary ${
                active === "soft drinks" ? "bg-secondary text-white" : ""
              }`}
              onClick={() => handleClick("soft drinks")}
            >
              Soft Drinks
            </Button>

            <Button
              size="lg"
              variant="outline"
              className={`hover:bg-secondary ${
                active === "hard liquor" ? "bg-secondary text-white" : ""
              }`}
              onClick={() => handleClick("hard liquor")}
            >
              Hard Liquor
            </Button>
          </div>
          {loading ? <InventoryItemsSkeleton /> : <InventoryItems onOpenModal={() => setIsModalOpen(true)} beverages={beverages} category={active}/>}
        </div>

        <div className="col-span-1 bg-mainWhite p-4 rounded-2xl">
          <AddItem />
        </div>
      </div>

      <AddBeverageModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        category={active}
      />
    </div>
  );
};

export default ManageInventory;
