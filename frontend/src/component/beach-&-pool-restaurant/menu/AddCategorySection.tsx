import { addNewExtraBeverageCategory } from '@/api/order/add-bevetage-category-api';
import { addNewFoodCategory } from '@/api/order/add-food-category-api';
import type { AppDispatch, RootState } from '@/app/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setSelectedCategory } from '@/features/beach-restaurant/beverageCategorySlice';
import { setSelectedCategoryId } from '@/features/beach-restaurant/foodCategorySlice';
import { BeverageCategories } from '@/lib/enums/order-related-enums';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const AddCategorySection = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { isClickedAddFoodCategory, isFoodCategory, addFoodCategoryStatus, categories} = useSelector((state:RootState) => state.foodCategory);
  const { addNewExtraBeverageCategoryStatus, selectedCategory } = useSelector((state:RootState) => state.beverageCategory);

  const [categoryName, setCategoryName] = useState<string>("");
  
  const isDisabled = categoryName === "";

  const handleAddCategory = async() => {
    try{
        if (isFoodCategory) {
          await dispatch(addNewFoodCategory({ categoryName })).unwrap();
          toast.success("Food category added successfully!");
          setCategoryName("");
          dispatch(setSelectedCategoryId(categories[0]._id));
          return;
        }
        await dispatch(addNewExtraBeverageCategory({ name:categoryName })).unwrap();
        if (selectedCategory ){
          dispatch(setSelectedCategory(""));
        }
        toast.success("Beverage category added successfully!");
        setCategoryName("");
        dispatch(setSelectedCategoryId(""));
        dispatch(setSelectedCategory(BeverageCategories.HARD_LIQUOR.value));
        return;
    }catch(error) {
         if (isClickedAddFoodCategory) {
           toast.error(
             addFoodCategoryStatus.error || "Failed to add food category"
           );
           return;
         }

         toast.error(
            addNewExtraBeverageCategoryStatus.error || "Failed to add beverage category"
         );
         return;
  }
}

  return (
     <div className="max-w-sm h-full text-[#444444] mx-auto p-4 flex flex-col items-center justify-between bg-mainWhite rounded-l-2xl">
      <div className="w-full">
        <p className="text-[1rem] font-[500] mb-4">Add Category</p>

        <FormRow label="Category Type :">
          {isFoodCategory ? "Food" : "Beverage"}
        </FormRow>

        <FormRow label="Category Name :">
          <Input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            className="!text-[0.75rem] placeholder:text-[0.75rem]"
          />
        </FormRow>

      </div>

      <Button
        className="w-full bg-primary hover:bg-primary cursor-pointer"
        disabled={isDisabled}
        onClick={handleAddCategory}
      >
       {addFoodCategoryStatus.loading || addNewExtraBeverageCategoryStatus.loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Processing
          </>
        ) : (
          "Add"
        )}
      </Button>
    </div>
  )
}

export default AddCategorySection;

/* Reusable FormRow component */
function FormRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-5 mb-3 items-center">
      <Label className="col-span-2 text-[0.75rem]">{label}</Label>
      <div className="col-span-3 text-[0.85rem] font-semibold">{children}</div>
    </div>
  );
}