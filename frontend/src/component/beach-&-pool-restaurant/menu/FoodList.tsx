import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '@/app/store';
import { useDispatch } from 'react-redux';
import { fetchAllFoodItems } from '@/api/order/get-food-list-api';
import type { FoodItem } from '../food-model';
import FoodItemSelector from './FoodItemSelector';
import { ScrollArea } from '@/components/ui/scroll-area';
import { setIsClickAddNewFoodItem } from '@/features/beach-restaurant/foodSlice';

const FoodList:React.FC = () => {
  const {foodItems:foods, isAddedNewFoodItem} = useSelector((state:RootState) => state.food);
  const selectedCategoryId = useSelector((state: RootState) => state.foodCategory.selectedCategoryId);
  const dispatch = useDispatch<AppDispatch>();

  const categoryFoods = foods.filter((food) => food.category?._id === selectedCategoryId);

  const handleAddNewFoodItem = () => {
    dispatch(setIsClickAddNewFoodItem(true));
  }

  useEffect( () => {
    dispatch(fetchAllFoodItems());
  },[isAddedNewFoodItem])

  return (
    <ScrollArea className="w-full h-[calc(100vh-250px)]">
      <div className="grid grid-cols-3 gap-1">
        <div className="py-8 flex items-center justify-center border rounded-sm" onClick={handleAddNewFoodItem}>
          <Plus size={24} className="text-[#0A869D]" />
        </div>
        {categoryFoods?.map((food:FoodItem, index) => (
          <FoodItemSelector foodItem={food} key={index} />
        ))}
      </div>
    </ScrollArea>
  );
}

export default FoodList;
