import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { OrderTokenType } from '../order-model';
import {
  decreaseQuantity,
  increaseQuantity,
  removeFoodItemFromOrderToken,
  removeAllOrderItemsFromToken,
  removeBeverageItemFromOrderToken,
  decreaseBeverageQuantity,
  increaseBeverageQuantity,
} from '@/features/beach-restaurant/orderSlice';
import type { RootState } from '@/app/store';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderTokenProps {
  token: OrderTokenType;
  isHoldOrder?: boolean;
}

const OrderToken: React.FC<OrderTokenProps> = ({ token, isHoldOrder }) => {
  
  const {fetchOrderDataStatus} = useSelector((state: RootState) => state.order);

  const { loading } = fetchOrderDataStatus;

  const dispatch = useDispatch();

  // Handlers
  const handleRemoveItem = useCallback(
    (index: number) => {
      dispatch(removeFoodItemFromOrderToken(index));
    },
    [dispatch]
  );

  const handleRemoveBeverageItem = useCallback(
    (index: number) => {
      dispatch(removeBeverageItemFromOrderToken(index));
    },
    [dispatch]
  );

  const handleDecreaseQuantity = useCallback(
    (foodId: string) => {
      dispatch(decreaseQuantity(foodId));
    },
    [dispatch]
  );

   const handleDecreaseBeverageQuantity = useCallback(
    (foodId: string) => {
      dispatch(decreaseBeverageQuantity(foodId));
    },
    [dispatch]
  );

  const handleIncreaseQuantity = useCallback(
    (foodId: string) => {
      dispatch(increaseQuantity(foodId));
    },
    [dispatch]
  );

  const handleIncreaseBeverageQuantity = useCallback(
    (foodId: string) => {
      dispatch(increaseBeverageQuantity(foodId));
    },
    [dispatch]
  );

  const handleClearAll = useCallback(() => {
    dispatch(removeAllOrderItemsFromToken());
  }, [dispatch]);

  return (
    <div className="mb-3 px-1.5 py-2 flex flex-col gap-3 bg-bg rounded-lg">
      {/* Skeletons while loading */}
      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="px-2 flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-2 flex flex-col gap-3 bg-mainWhite rounded-xs"
            >
              {/* Title + Trash Button Skeleton */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-6" />
              </div>

              {/* Quantity Controls + Price Skeleton */}
              <div className="px-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7" />
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-7 w-7" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Token Header */}
          <div className="px-2 flex items-center justify-between">
            <p className="text-[0.875rem] text-[#444444] font-[500]">
              Token {String(token.tokenNumber).padStart(2, "0")}
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
                .map((item, index) => (
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
                            disabled={token.isPrinted || isHoldOrder}
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
                          disabled={token.isPrinted || isHoldOrder}
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
                          disabled={token.isPrinted || isHoldOrder}
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

          {/* Beverage Orders */}
          {token.beverageOrders.length > 0 && (
            <div className="flex flex-col gap-3">
              {token.beverageOrders
                .slice()
                .reverse()
                .map((item, index) => (
                  <div
                    key={item.beverageId}
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
                            disabled={token.isPrinted || isHoldOrder}
                            onClick={() => handleRemoveBeverageItem(index)}
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
                          disabled={token.isPrinted || isHoldOrder}
                          onClick={() =>
                            handleDecreaseBeverageQuantity(item.beverageId)
                          }
                        >
                          <Minus size={10} strokeWidth={1.5} />
                        </Button>

                        <div className="px-2 py-1 text-[0.75rem] border">
                          {item.quantity}
                        </div>

                        <Button
                          variant="outline"
                          className="!p-1 !h-7 !rounded-none cursor-pointer"
                          disabled={token.isPrinted || isHoldOrder}
                          onClick={() =>
                            handleIncreaseBeverageQuantity(item.beverageId)
                          }
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
        </>
      )}
    </div>
  );
};

export default OrderToken;
