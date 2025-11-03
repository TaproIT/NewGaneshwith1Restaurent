import { Button } from "@/components/ui/button";
import React, { use, useEffect, useState } from "react";
import UpdateBeverageModal from "./UpdateBeverageModal";
import { api } from "@/api/axios";
import type { BeverageItem } from "@/types/BeverageItem";
import AddItemSkeleton from "@/component/skeleton/AddItemSkeleton";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";

interface AddItemProps {
  selectedBeverage: string;
  onModalChange?: (open: boolean) => void;
}

const AddItem: React.FC<AddItemProps> = ({ selectedBeverage, onModalChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState("")
  const [beverage, setBeverage] = useState<BeverageItem>()
  const [loading, setLoading] = useState(true);

  const handleModalChange = (open: boolean) => {
    setIsModalOpen(open);
    onModalChange?.(open);
    setAction("restock")
  };

  const handleRemoveModalChange = (open: boolean) => {
    setIsModalOpen(open);
    onModalChange?.(open);
    setAction("remove")
  };

  const { rates } = useRates();
  const { displayCurrency } = useCurrency();

  const displayPrice = convertAndFormatPrice(
    beverage ? beverage.price : 0, 
    rates, 
    displayCurrency
  );

  useEffect(() => {
  const fetchBeverage = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/beverages/${selectedBeverage}`);
      setBeverage(response.data.data);
    } catch (error) {
      console.error("Error fetching beverages:", error);
    } finally {
      setLoading(false);
    }
  }

  fetchBeverage()
}, [selectedBeverage, isModalOpen])

  return (
    <>
    {selectedBeverage ? (loading ? <AddItemSkeleton /> : <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Content */}
      <div className="flex-1 mt-4 flex flex-col gap-4">
        <div className="font-medium text-lg text-gray">Add item</div>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 text-sm text-gray">
            <div className="col-span-1">Item name</div>
            <div className="col-span-1">:</div>
            <div className="col-span-1">
              {beverage?.beverageName}
            </div>
          </div>
          <div className="grid grid-cols-3 text-sm text-gray">
            <div className="col-span-1">Price per 1</div>
            <div className="col-span-1">:</div>
            <div className="col-span-1">
              {displayPrice}
            </div>
          </div>
          <div className="grid grid-cols-3 text-sm text-gray">
            <div className="col-span-1">Quantity</div>
            <div className="col-span-1">:</div>
            <div className="col-span-1">
              {beverage?.runningStock}
            </div>
          </div>
        </div>
      </div>

      {/* Footer fixed at bottom */}
      <div className="border-t p-4 flex flex-col gap-3 bg-white">
        <Button variant="outline" className="border-1 border-primary text-primary" onClick={() => handleRemoveModalChange(true)}>
          Remove
        </Button>
        <Button onClick={() => handleModalChange(true)}>Update</Button>
      </div>

      <UpdateBeverageModal
        selectedBeverage={selectedBeverage}
        open={isModalOpen}
        onOpenChange={handleModalChange}
        action={action}
      />
    </div>) : <div className="text-sm text-gray p-5">Select an item</div> }
    </>
  );
};

export default AddItem;
