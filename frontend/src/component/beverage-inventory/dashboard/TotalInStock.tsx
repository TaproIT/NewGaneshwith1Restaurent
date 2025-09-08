import type { BeverageItem } from "@/types/BeverageItem";
import { Users } from "lucide-react";

interface Props {
  items: BeverageItem[];
}

const TotalInStock: React.FC<Props> = ({ items }) => {
  // Calculate totals
  const totalInStock = items.reduce((sum, item) => sum + item.currentMonthStock, 0);

  const softDrinksTotal = items
    .filter(item => item.category === "soft drinks")
    .reduce((sum, item) => sum + item.currentMonthStock, 0);

  const colaTotal = items
    .filter(item => item.category === "cola")
    .reduce((sum, item) => sum + item.currentMonthStock, 0);

  const hardLiquorTotal = items
    .filter(item => item.category === "hard liquor")
    .reduce((sum, item) => sum + item.currentMonthStock, 0);

  return (
    <div className="p-4 bg-mainWhite rounded-2xl flex gap-4 flex-col">
      <div className="flex justify-between">
        <div className="p-4 rounded-2xl bg-[#F2F4F7] flex justify-center items-center text-center">
          <Users color="#1D2939" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-[#B4AEAE] font-medium text-[16px]">Total in Stock</div>
          <div className="text-gray font-bold text-2xl">{totalInStock}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Soft Drinks</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">{softDrinksTotal}</div>
        </div>
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Cola</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">{colaTotal}</div>
        </div>
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Hard Liqueur</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">{hardLiquorTotal}</div>
        </div>
      </div>
    </div>
  )
};

export default TotalInStock;
