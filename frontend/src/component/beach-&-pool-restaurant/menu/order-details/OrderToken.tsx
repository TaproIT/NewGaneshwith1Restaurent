import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { OrderFoodItem, OrderTokenType } from '../../order-model';
import {
  decreaseQuantity,
  increaseQuantity,
  removeFoodItemFromOrderToken,
  removeAllOrderItemsFromToken,
} from '@/features/beach-restaurant/orderSlice';

interface OrderTokenProps {
  token: OrderTokenType;
}

const OrderToken: React.FC<OrderTokenProps> = ({ token }) => {
  //console.log("t", token);
  const dispatch = useDispatch();

  // Handlers
  const handleRemoveItem = useCallback(
    (index: number) => {
      dispatch(removeFoodItemFromOrderToken(index));
    },
    [dispatch]
  );

  const handleDecreaseQuantity = useCallback(
    (foodId: string) => {
      dispatch(decreaseQuantity(foodId));
    },
    [dispatch]
  );

  const handleIncreaseQuantity = useCallback(
    (foodId: string) => {
      dispatch(increaseQuantity(foodId));
    },
    [dispatch]
  );

  const handleClearAll = useCallback(() => {
    dispatch(removeAllOrderItemsFromToken());
  }, [dispatch]);

  return (
    <div className="mb-3 px-1.5 py-2 flex flex-col gap-3 bg-bg rounded-lg">
      {/* Token Header */}
      <div className="px-2 flex items-center justify-between">
        <p className="text-[0.875rem] text-[#444444] font-[500]">
          Token{' '}
          {String(token.tokenNumber).padStart(2, '0')}
        </p>
        {!token.isPrinted && (
          <p
            className="text-[0.625rem] text-[#0A869D] font-normal cursor-pointer"
            onClick={handleClearAll}
          >
            Clear All
          </p>
        )}
      </div>

      {/* Food Orders */}
      {token.foodOrders.length > 0 && (
        <div className="flex flex-col gap-3">
          {token.foodOrders
            .slice()
            .reverse()
            .map((item: OrderFoodItem, index: number) => (
              <div
                key={item.foodId}
                className="p-2 flex flex-col gap-3 bg-mainWhite rounded-xs"
              >
                {/* Item Title and Remove Button */}
                <div className="flex items-center justify-between text-[#444444]">
                  <p className="text-[0.75rem]">{item.title}</p>
                  <div className="flex items-center justify-center gap-2">
                    {!token.isPrinted && (
                      <Button
                        variant="outline"
                        className="!p-1 !h-7 !rounded-none hover:!bg-transparent !border-none cursor-pointer"
                        disabled={token.isPrinted}
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quantity Controls and Price */}
                <div className="px-2 flex items-center justify-between gap-2">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      className="!p-1 !h-7 !rounded-none cursor-pointer"
                      disabled={token.isPrinted}
                      onClick={() => handleDecreaseQuantity(item.foodId)}
                    >
                      <Minus size={10} strokeWidth={1.5} />
                    </Button>

                    <div className="px-2 py-1 text-[0.75rem] border">
                      {item.quantity}
                    </div>

                    <Button
                      variant="outline"
                      className="!p-1 !h-7 !rounded-none cursor-pointer"
                      disabled={token.isPrinted}
                      onClick={() => handleIncreaseQuantity(item.foodId)}
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
    </div>
  );
};

export default OrderToken;
