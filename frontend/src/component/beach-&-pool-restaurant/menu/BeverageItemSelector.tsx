import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import type { BeverageItem } from '../beverage-model';
import type { OrderBeverageItem } from '../order-model';
import { addBeverageItemToOrderToken } from '@/features/beach-restaurant/orderSlice';
import { useParams } from 'react-router-dom';

import { useCurrency } from '@/context/CurrencyContext'; 
import { useRates } from '@/context/RateContext'; 
import { convertAndFormatPrice } from '@/util/priceConverter'; 
interface BeverageItemSelectorProps {
  beverageItem: BeverageItem;
}

const BeverageItemSelector: React.FC<BeverageItemSelectorProps> = ({ beverageItem }) => {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);
  
  const { displayCurrency } = useCurrency();
  const { rates } = useRates(); 

  const param = useParams();
  const id = param?.id as string;

  const orderBeverageItems = order.newOrderToken?.beverageOrders;

  // Check if the food item already exists in the current new order token
  const existBeverageItem = orderBeverageItems?.some((item) => item.beverageId === beverageItem._id);

  // Determine whether the Add button should be disabled
  const isDisabled = existBeverageItem || (order.orderTokens.length > 0 && !order.isAddNewOrderToken && !order.holdOrderToken) || id==="0";

  const displayPrice = convertAndFormatPrice(
    beverageItem.price, 
    rates, 
    displayCurrency
  );

  // Handler to add food item to new order token
  const handleAddClick = useCallback(() => {
    const orderBeverageItem: OrderBeverageItem = {
      beverageId: beverageItem._id,
      title: beverageItem.beverageName,
      price: beverageItem.price, 
      quantity: 1,
    };
    dispatch(addBeverageItemToOrderToken(orderBeverageItem));
  }, [dispatch, beverageItem]);
  
  return (
    <div className="p-1 flex flex-col gap-1 border rounded-sm">
      {/* Beverage item name */}
      <div className="py-6 flex items-center justify-center text-[#444444] text-[0.625rem] capitalize bg-[#F4F4F4] rounded-sm">
        {beverageItem.beverageName}
      </div>

      {/* Price and Add button */}
      <div className="grid grid-cols-7 gap-1">
        <div className="py-1.5 col-span-5 bg-[#F4F4F4] flex items-center justify-center rounded-sm">
          <p className="text-[#0A869D] text-[0.75rem]">{displayPrice}</p>
        </div>
        <Button
          className="col-span-2 !w-full !h-full flex items-center justify-center rounded-sm cursor-pointer"
          onClick={handleAddClick}
          disabled={isDisabled}
        >
          <Plus size={16} className="text-[#FEFEFE]" />
        </Button>
      </div>
    </div>
  );
};

export default BeverageItemSelector;