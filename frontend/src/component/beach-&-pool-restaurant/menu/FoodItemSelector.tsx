import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import React, { useEffect } from 'react';
import type { FoodItem } from '../food-model';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import type { OrderFoodItem } from '../order-model';
import { addFoodItemToOrderToken } from '@/features/beach-restaurant/orderSlice';


const FoodItemSelector:React.FC<{foodItem:FoodItem}> = (
   {foodItem}
) => {
  const orderFoodItems = useSelector((state:RootState) => state.order.newOrderToken?.foodItems);
  const dispatch = useDispatch<AppDispatch>();

  const existFoodItem = orderFoodItems?.find((item) => item.foodId === foodItem.id);

  const handleAddClick = (foodItem: FoodItem) => {
    const orderFoodItem:OrderFoodItem = {
       foodId: foodItem.id,
       title: foodItem.title,
       price: foodItem.price,
       quantity:1
    }

   //  orderFoodItems?.push(orderFoodItem);
   dispatch(addFoodItemToOrderToken(orderFoodItem));
  }

  useEffect(() => {
    
  } , [orderFoodItems?.length])

  return (
    <div className="p-1 flex flex-col gap-1 border rounded-sm">
      <div className="py-6 flex items-center justify-center text-[#444444] text-[0.625rem] bg-[#F4F4F4] rounded-sm">
         {foodItem?.title}
      </div>
      <div className="grid grid-cols-7 gap-1">
         <div className="py-1.5 col-span-5 bg-[#F4F4F4] flex items-center justify-center rounded-sm">
            <p className="text-[#0A869D] text-[0.75rem]">
              LKR {foodItem?.price}
            </p>
         </div>
         <Button className="col-span-2 !w-full !h-full flex items-center justify-center rounded-sm cursor-pointer"
           onClick={ ()=> handleAddClick(foodItem) }
           disabled={ existFoodItem? true: false}
         >
            <Plus size={16}  className="text-[#FEFEFE]" />
         </Button>
      </div>
    </div>
  )
}

export default FoodItemSelector;
