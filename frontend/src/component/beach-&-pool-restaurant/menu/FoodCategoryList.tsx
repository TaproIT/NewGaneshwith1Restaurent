import React from 'react';
import CategorySelector from './CategorySelector';
import FoodList from './FoodList';

const FoodCategoryList: React.FC = () => { 

  return (
    <div className="flex flex-col gap-5 w-full">
      <CategorySelector />
      <FoodList />
    </div>
  );
}

export default FoodCategoryList;
