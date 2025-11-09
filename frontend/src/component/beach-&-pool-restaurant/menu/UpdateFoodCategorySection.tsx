import { updateFoodCategory } from "@/api/order/update-food-category-api";
//import { updateBeverageCategory } from "@/api/order/update-beverage-category-api";
import type { AppDispatch, RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const UpdateCategorySection = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    selectedCategoryId,
    selectedFoodCategoryTitle,
    isFoodCategory,
    updateFoodCategoryStatus,
  } = useSelector((state: RootState) => state.foodCategory);

  const {
    selectedCategory,
    //updateBeverageCategoryStatus,
    selectedBeverageCategoryTitle,
  } = useSelector((state: RootState) => state.beverageCategory);

  // prefill input if a category is selected
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    if (isFoodCategory && selectedCategoryId) {
      setCategoryName(selectedFoodCategoryTitle ?? "");
    } else if (!isFoodCategory && selectedCategory) {
      setCategoryName(selectedFoodCategoryTitle ?? "");
    } else {
      setCategoryName("");
    }
  }, [isFoodCategory, selectedFoodCategoryTitle, selectedBeverageCategoryTitle]);

  const isDisabled = categoryName.trim() === "";

  const handleUpdateCategory = async () => {
    try {
      if (isFoodCategory && selectedFoodCategoryTitle) {
        await dispatch(
          updateFoodCategory({
            categoryId: selectedCategoryId,
            categoryName,
          })
        ).unwrap();
        toast.success("Food category updated successfully!");
        return;
      }

    //   if (selectedBeverageCategory) {
    //     await dispatch(
    //       updateBeverageCategory({
    //         id: selectedBeverageCategory._id,
    //         name: categoryName,
    //       })
    //     ).unwrap();
    //     toast.success("Beverage category updated successfully!");
    //     return;
    //   }

      toast.error("No category selected for update.");
    } catch (error) {
      if (isFoodCategory) {
        toast.error(
          updateFoodCategoryStatus.error || "Failed to update food category"
        );
      } else {
        // toast.error(
        //   updateBeverageCategoryStatus.error ||
        //     "Failed to update beverage category"
        // );
      }
    }
  };

  return (
    <div className="max-w-sm h-full text-[#444444] mx-auto p-4 flex flex-col items-center justify-between bg-mainWhite rounded-l-2xl">
      <div className="w-full">
        <p className="text-[1rem] font-[500] mb-4">Update Category</p>

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
        onClick={handleUpdateCategory}
      >
        {updateFoodCategoryStatus.loading ? (
        //updateBeverageCategoryStatus.loading 
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Processing
          </>
        ) : (
          "Update"
        )}
      </Button>
    </div>
  );
};

export default UpdateCategorySection;

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
