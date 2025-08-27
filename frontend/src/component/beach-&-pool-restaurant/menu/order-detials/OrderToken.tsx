import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area';

import { Minus, Plus, SquarePen, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

const OrderToken:React.FC = () => {
  const [quantity, setQuantity] = useState<number>(1);

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

    const decreaseQuantity = () => {
     if (quantity > 1){
       setQuantity(quantity - 1);
     }
  };

  return (
    <div className="mb-2 px-1.5 py-2 flex flex-col gap-3 bg-bg rounded-lg">
      <div className="px-2 flex items-center justify-between">
        <p className="text-[0.875rem] text-[#444444] font-[500]">Token 01</p>
        <p className="text-[0.625rem] text-[#0A869D] font-normal">Clear All</p>
      </div>

      <ScrollArea className="h-[calc(100vh-570px)] 2xl:h-[calc(100vh-700px)]">
        <div className="flex flex-col gap-3">
          <div className="p-2 flex flex-col gap-3 bg-mainWhite rounded-xs">
            <div className="flex items-center justify-between text-[#444444]">
              <p className="text-[0.75rem]">Vegetable Soup</p>
              <div className="flex items-center justify-center gap-2">
                <SquarePen size={14} />
                <Trash2 size={14} />
              </div>
            </div>

            <div className="px-2 flex items-center justify-between gap-2">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  className="!p-1 !h-7 !rounded-none cursor-pointer"
                  onClick={decreaseQuantity}
                >
                  <Minus size={10} strokeWidth={1.5} />
                </Button>

                <div className="px-2 py-1 text-[0.75rem] border">
                  {quantity}
                </div>

                <Button
                  variant="outline"
                  className="!p-1 !h-7 !rounded-none cursor-pointer"
                  onClick={increaseQuantity}
                >
                  <Plus size={10} strokeWidth={1.5} />
                </Button>
              </div>

              <div className="px-6 py-1.5 flex items-center justify-center text-[0.75rem] text-[#444444] bg-[#F4F4F4] rounded-xs">
                LKR 1200.00
              </div>
            </div>
          </div>

          <div className="p-2 flex flex-col gap-3 bg-mainWhite rounded-xs">
            <div className="flex items-center justify-between text-[#444444]">
              <p className="text-[0.75rem]">Vegetable Soup</p>
              <div className="flex items-center justify-center gap-2">
                <SquarePen size={14} />
                <Trash2 size={14} />
              </div>
            </div>

            <div className="px-2 flex items-center justify-between gap-2">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  className="!p-1 !h-7 !rounded-none cursor-pointer"
                  onClick={decreaseQuantity}
                >
                  <Minus size={10} strokeWidth={1.5} />
                </Button>

                <div className="px-2 py-1 text-[0.75rem] border">
                  {quantity}
                </div>

                <Button
                  variant="outline"
                  className="!p-1 !h-7 !rounded-none cursor-pointer"
                  onClick={increaseQuantity}
                >
                  <Plus size={10} strokeWidth={1.5} />
                </Button>
              </div>

              <div className="px-6 py-1.5 flex items-center justify-center text-[0.75rem] text-[#444444] bg-[#F4F4F4] rounded-xs">
                LKR 1200.00
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default OrderToken
