import React from 'react';
import FoodCategoryList from './FoodCategoryList';

const FoodMenuDetailsSection: React.FC<{id:string}> = ({id}) => {
  return (
    <div className="p-4 flex flex-col bg-mainWhite rounded-2xl">
       <div className="pt-4 px-4 flex items-center justify-end gap-4 mb-4">
        <Legend color="bg-[#E37E0A]" label="Food" />
        <Legend color="bg-[#8B0000]" label="Liquor and Soft Drinks" />
        <Legend color="bg-[#1A81B5]" label="Extra Beverages" />
      </div>
      <FoodCategoryList id={id} />
    </div>
  )
}

export default FoodMenuDetailsSection;

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${color} rounded-full`} />
    <p className="text-black text-[0.75rem]">{label}</p>
  </div>
);
