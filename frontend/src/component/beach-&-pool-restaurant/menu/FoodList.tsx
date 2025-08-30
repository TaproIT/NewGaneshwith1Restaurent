import React from 'react';
import { Plus } from 'lucide-react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import FoodItemSelector from './FoodItemSelector';
import type { FoodItem } from '../food-model';

const FoodList:React.FC = () => {
  const foods = useSelector((state:RootState) => state.food);

  const categoryFoods = foods.foods.filter((food) => food.categoryId === foods.selectedCategoryId);
  
  return (
    <ScrollArea className="h-[calc(100vh-230px)]">
      <div className="grid grid-cols-5 gap-1">
        <div className="py-10 flex items-center justify-center border rounded-sm">
          <Plus size={24} className="text-[#0A869D]" />
        </div>
        {categoryFoods?.map((food:FoodItem) => (
          <FoodItemSelector foodItem={food} />
        ))}
      </div>
    </ScrollArea>
  );
}

export default FoodList;
