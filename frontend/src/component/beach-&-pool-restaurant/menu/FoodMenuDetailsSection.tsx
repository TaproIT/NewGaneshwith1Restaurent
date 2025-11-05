import React from 'react';
import FoodCategoryList from './FoodCategoryList';

const FoodMenuDetailsSection: React.FC<{id:string}> = ({id}) => {
  return (
    <div className="p-4 flex flex-col bg-mainWhite rounded-2xl">
      <FoodCategoryList id={id} />
    </div>
  )
}

export default FoodMenuDetailsSection;
