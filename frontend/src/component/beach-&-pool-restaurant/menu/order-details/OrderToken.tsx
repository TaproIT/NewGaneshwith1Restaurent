import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, SquarePen, Trash2 } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { OrderFoodItem, OrderTokenType } from '../../order-model';
import { decreaseQuantity, increaseQuantity } from '@/features/beach-restaurant/orderSlice';
import type { RootState } from '@/app/store';

const OrderToken: React.FC<{ token: OrderTokenType }> = ({ token }) => {
  const dispatch = useDispatch();
  const orderTokens = useSelector((state:RootState) => state.order.orderTokens);

  return (
    <div className="mb-2 px-1.5 py-2 flex flex-col gap-3 bg-bg rounded-lg">
      <div className="px-2 flex items-center justify-between">
        <p className="text-[0.875rem] text-[#444444] font-[500]">
          Token{" "}
          {String(
            orderTokens.length === 0 ? 1 : orderTokens.length + 1
          ).padStart(2, "0")}
        </p>
        <p className="text-[0.625rem] text-[#0A869D] font-normal">Clear All</p>
      </div>

      <ScrollArea className="h-[calc(100vh-530px)] 2xl:h-[calc(100vh-700px)]">
        {token && (
          <div className="flex flex-col gap-3">
            {token.foodItems
              .slice()  // Create a shallow copy of the array to avoid mutating the original array
              .reverse()  // Reverse the order of items
              .map((item: OrderFoodItem) => (
              <div
                key={item.foodId}
                className="p-2 flex flex-col gap-3 bg-mainWhite rounded-xs"
              >
                <div className="flex items-center justify-between text-[#444444]">
                  <p className="text-[0.75rem]">{item.title}</p>
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
                      onClick={() => dispatch(decreaseQuantity(item.foodId))}
                    >
                      <Minus size={10} strokeWidth={1.5} />
                    </Button>

                    <div className="px-2 py-1 text-[0.75rem] border">
                      {item.quantity}
                    </div>

                    <Button
                      variant="outline"
                      className="!p-1 !h-7 !rounded-none cursor-pointer"
                      onClick={() => dispatch(increaseQuantity(item.foodId))}
                    >
                      <Plus size={10} strokeWidth={1.5} />
                    </Button>
                  </div>

                  <div className="px-6 py-1.5 flex items-center justify-center text-[0.75rem] text-[#444444] bg-[#F4F4F4] rounded-xs">
                    LKR {item.price * item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default OrderToken;
