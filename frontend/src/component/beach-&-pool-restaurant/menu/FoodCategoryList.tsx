import React from 'react';
import FoodCategorySelector from './FoodCategorySelector';
import FoodList from './FoodList';
import BeverageCategorySelector from './BeverageCategorySelector';

const FoodCategoryList: React.FC = () => { 

  return (
    <div className="flex flex-col gap-2 w-full">
      <FoodCategorySelector />
      <div className="w-full grid grid-cols-5 gap-2">
         <div className="col-span-1">
            <BeverageCategorySelector />
         </div>
         <div className="col-span-4">
            <FoodList />
         </div>
      </div>
    </div>
  );
}

export default FoodCategoryList;
