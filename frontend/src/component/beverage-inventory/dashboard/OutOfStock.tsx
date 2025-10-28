import { Users } from "lucide-react";

const OutOfStock = () => {
  return (
    <div className="p-4 bg-mainWhite rounded-2xl flex gap-4 flex-col">
      <div className="flex justify-between">
        <div className="p-4 rounded-2xl bg-[#F2F4F7] flex justify-center items-center text-center"><Users color="#1D2939"/></div>
        <div className="flex flex-col gap-2">
          <div className="text-[#B4AEAE] font-medium text-[16px]">Out of Stock</div>
          <div className="text-gray font-bold text-2xl">12,450</div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Soft Drinks</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">5623</div>
        </div>
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Cola</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">5623</div>
        </div>
        <div className="grid-cols-4 text-[#6F6868] text-[14px] font-medium grid">
          <div className="col-span-2">Hard Liqueur</div>
          <div className="col-span-1">:</div>
          <div className="col-span-1">5623</div>
        </div>
      </div>
    </div>
  )
};

export default OutOfStock;
