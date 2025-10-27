import React from 'react';
import FoodCategoryList from './FoodCategoryList';

const FoodMenuDetailsSection: React.FC = () => {
  return (
    <div className="p-4 flex flex-col bg-mainWhite rounded-2xl">
      <FoodCategoryList />
    </div>
  )
}

export default FoodMenuDetailsSection;
