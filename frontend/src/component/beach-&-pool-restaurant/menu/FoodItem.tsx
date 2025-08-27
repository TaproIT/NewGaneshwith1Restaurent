import { Plus } from 'lucide-react';
import React from 'react';

interface FoodItemSelectorPops {
    title: string;
    price: number;
}

const FoodItemSelector:React.FC<FoodItemSelectorPops> = ({
    title,
    price
}) => {
  return (
    <div className="p-1 flex flex-col gap-1 border rounded-sm">
      <div className="py-6 flex items-center justify-center text-[#444444] text-[0.625rem] bg-[#F4F4F4] rounded-sm">
         {title}
      </div>
      <div className="grid grid-cols-7 gap-1">
         <div className="py-1.5 col-span-5 bg-[#F4F4F4] flex items-center justify-center rounded-sm">
            <p className="text-[#0A869D] text-[0.75rem]">
              LKR {price}
            </p>
         </div>
         <div className="py-1.5 col-span-2 flex items-center justify-center bg-[#0A869D] rounded-sm">
           <Plus size={16}  className="text-[#FEFEFE]" />
         </div>
      </div>
    </div>
  )
}

export default FoodItemSelector;
