import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import React, { useCallback } from 'react';
import type { FoodItem } from '../food-model';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import type { OrderFoodItem } from '../order-model';
import { addFoodItemToOrderToken } from '@/features/beach-restaurant/orderSlice';
import { useParams } from 'react-router-dom';

interface FoodItemSelectorProps {
  foodItem: FoodItem;
}

const FoodItemSelector: React.FC<FoodItemSelectorProps> = ({ foodItem }) => {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);

  const param = useParams();
  const id = param?.id as string;

  const orderFoodItems = order.newOrderToken?.foodOrders;

  // Check if the food item already exists in the current new order token
  const existFoodItem = orderFoodItems?.some((item) => item.foodId === foodItem._id);

  // Determine whether the Add button should be disabled
  const isDisabled = existFoodItem || (order.orderTokens.length > 0 && !order.isAddNewOrderToken && !order.holdOrderToken) || id==="0" ;

  // Handler to add food item to new order token
  const handleAddClick = useCallback(() => {
    const orderFoodItem: OrderFoodItem = {
      foodId: foodItem._id,
      title: foodItem.itemName,
      price: foodItem.price,
      quantity: 1,
    };
    dispatch(addFoodItemToOrderToken(orderFoodItem));
  }, [dispatch, foodItem]);

  return (
    <div className="p-1 flex flex-col gap-1 border rounded-sm">
      {/* Food item name */}
      <div className="py-6 flex items-center justify-center text-[#444444] text-[0.625rem] bg-[#F4F4F4] rounded-sm">
        {foodItem.itemName}
      </div>

      {/* Price and Add button */}
      <div className="grid grid-cols-7 gap-1">
        <div className="py-1.5 col-span-5 bg-[#F4F4F4] flex items-center justify-center rounded-sm">
          <p className="text-[#0A869D] text-[0.75rem]">LKR {foodItem.price}</p>
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

export default FoodItemSelector;
