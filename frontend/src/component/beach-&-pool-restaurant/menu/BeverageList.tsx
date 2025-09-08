import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '@/app/store';
import { useDispatch } from 'react-redux';
import FoodItemSelector from './FoodItemSelector';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchAllBeverageItems } from '@/api/order/get-beverage-list-api';
import type { BeverageItem } from '../beverage-model';
import BeverageItemSelector from './BeverageItemSelector';

const BeverageList:React.FC = () => {
  const beverages = useSelector((state:RootState) => state.beverage.beverageItems);
  const selectedCategoryId = useSelector((state: RootState) => state.beverageCategory.selectedCategoryId);
  const dispatch = useDispatch<AppDispatch>();

  const categoryBeverages = beverages.filter((beverage) => beverage.category?._id === selectedCategoryId);
  useEffect( () => {
    dispatch(fetchAllBeverageItems());
  },[])

  return (
    <ScrollArea className="w-full h-[calc(100vh-250px)]">
      <div className="grid grid-cols-3 gap-1">
        <div className="py-8 flex items-center justify-center border rounded-sm">
          <Plus size={24} className="text-[#0A869D]" />
        </div>
        {categoryBeverages?.map((beverage:BeverageItem) => (
          <BeverageItemSelector beverageItem={beverage} />
        ))}
      </div>
    </ScrollArea>
  );
}

export default BeverageList;
