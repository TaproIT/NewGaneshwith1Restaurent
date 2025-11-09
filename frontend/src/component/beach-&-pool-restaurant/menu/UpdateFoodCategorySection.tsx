import { deleteFoodCategory } from "@/api/order/delete-food-category-api";
import { updateFoodCategory } from "@/api/order/update-food-category-api";
// import { updateBeverageCategory } from "@/api/order/update-beverage-category-api";
import type { AppDispatch, RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
    fetchAllFoodCategoriesStatus
  } = useSelector((state: RootState) => state.foodCategory);

  const {
    selectedCategory,
    // updateBeverageCategoryStatus,
    selectedBeverageCategoryTitle,
  } = useSelector((state: RootState) => state.beverageCategory);


  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    if (isFoodCategory && selectedCategoryId) {
      setCategoryName(selectedFoodCategoryTitle ?? "");
    } else if (!isFoodCategory && selectedCategory) {
      setCategoryName(selectedBeverageCategoryTitle ?? "");
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

      toast.error("No category selected for update.");
    } catch (error) {
      if (isFoodCategory) {
        toast.error(
          updateFoodCategoryStatus.error || "Failed to update food category"
        );
      }
    }
  };

  const handleDeleteItem = async () => {
    try {
      if (selectedCategoryId !== null) {
        await dispatch(deleteFoodCategory({ categoryId: selectedCategoryId }));
      }

      toast.success("Category deleted successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete item");
    }
  };

  return (
    <div className="max-w-sm h-full text-[#444444] mx-auto p-4 flex flex-col items-center justify-between bg-mainWhite rounded-l-2xl">
      {fetchAllFoodCategoriesStatus.loading ? (
        // --- Skeleton Loader ---
        <div className="w-full flex flex-col justify-between h-full">
          <div>
            <Skeleton className="h-5 w-32 mb-4" /> {/* Title */}
            <div className="grid grid-cols-5 mb-3 items-center">
              <Skeleton className="col-span-2 h-4 w-20" />
              <Skeleton className="col-span-3 h-4 w-24" />
            </div>
            <div className="grid grid-cols-5 mb-3 items-center">
              <Skeleton className="col-span-2 h-4 w-20" />
              <Skeleton className="col-span-3 h-8 w-full rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Skeleton className="h-9 w-full rounded" /> {/* Update btn */}
            <Skeleton className="h-9 w-full rounded" /> {/* Remove btn */}
          </div>
        </div>
      ) : (
        // --- Actual UI ---
        <>
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

          <div className="w-full flex flex-col gap-2">
            <Button
              className="w-full bg-primary hover:bg-primary cursor-pointer"
              disabled={isDisabled}
              onClick={handleUpdateCategory}
            >
              {updateFoodCategoryStatus.loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Processing
                </>
              ) : (
                "Update"
              )}
            </Button>

            <Button
              className="w-full cursor-pointer border-Primary_blue"
              disabled={isDisabled}
              variant="outline"
              onClick={handleDeleteItem}
            >
              Remove
            </Button>
          </div>
        </>
      )}
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
