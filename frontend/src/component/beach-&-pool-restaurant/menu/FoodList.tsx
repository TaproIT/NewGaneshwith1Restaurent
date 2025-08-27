import React from 'react';
import { Plus } from 'lucide-react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import type { FoodItem } from '@/features/beach-restaurant/foodSlice';
import FoodItemSelector from './FoodItem';

const foods = [
  { categoryId: "breakfast", title: "Pancakes", price: 450 },
  { categoryId: "breakfast", title: "Omelette", price: 400 },
  { categoryId: "lunch", title: "Chicken Rice", price: 650 },
  { categoryId: "lunch", title: "Vegetable Curry", price: 550 },
  { categoryId: "dinner", title: "Grilled Fish", price: 800 },
  { categoryId: "dinner", title: "Steak", price: 1200 },
  { categoryId: "drinks", title: "Fresh Juice", price: 300 },
  { categoryId: "drinks", title: "Coffee", price: 250 },
  { categoryId: "dessert", title: "Ice Cream", price: 400 },
  { categoryId: "dessert", title: "Cheesecake", price: 500 },
];

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
          <FoodItemSelector title={food.title} price={food.price} />
        ))}
      </div>
    </ScrollArea>
  );
}

export default FoodList;
