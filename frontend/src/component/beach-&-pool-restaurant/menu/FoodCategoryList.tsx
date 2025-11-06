import React, { useEffect } from 'react';
import FoodCategorySelector from './FoodCategorySelector';
import FoodList from './FoodList';
import BeverageCategorySelector from './BeverageCategorySelector';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import BeverageList from './BeverageList';

const FoodCategoryList: React.FC<{id:string}> = ({id}) => { 
  const isBeverageItemList = useSelector((state:RootState) => state.beverageCategory.isBeverageItemList);
  useEffect(() => {

  },[isBeverageItemList]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <FoodCategorySelector id={id} />
      <div className="w-full grid grid-cols-5">
         <div className="col-span-1">
            <BeverageCategorySelector id={id} />
         </div>
         <div className="col-span-4">
             {
               isBeverageItemList ? (
                 <BeverageList id={id} />
               ): (
                 <FoodList id={id} />
               )
             }
         </div>
      </div>
    </div>
  );
}

export default FoodCategoryList;
