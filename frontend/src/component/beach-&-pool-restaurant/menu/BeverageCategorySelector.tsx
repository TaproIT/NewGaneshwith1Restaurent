import type { AppDispatch, RootState } from "@/app/store";
import {
  setSelectedCategory,
  setIsBeverageItemsList,
  setSelectedBeverageCategoryTitle,
} from "@/features/beach-restaurant/beverageCategorySlice";
import { setIsClickedAddFoodCategory, setIsClickedUpdateFoodCategory, setIsFoodCategory, setSelectedCategoryId, setSelectedFoodCategoryTitle } from "@/features/beach-restaurant/foodCategorySlice";
import { setIsClickAddNewFoodItem, setSelectedFoodItem } from "@/features/beach-restaurant/foodSlice";
import { BeverageCategories } from "@/lib/enums/order-related-enums";
import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { fetchAllExtraBeverageCategories } from "@/api/order/get-extra-beverge-categories-api";
import { Edit, Plus } from "lucide-react";
import { setSelectedBeverageItem, setSelectedExtraBeverageItem } from "@/features/beach-restaurant/beverageSlice";


const BeverageCategorySelector: React.FC<{id:string}> = ({id}) => {
  const dispatch = useDispatch<AppDispatch>();
  const beverageCategory = useSelector(
    (state: RootState) => state.beverageCategory
  );

   const foodCategory = useSelector(
    (state: RootState) => state.foodCategory
  );

   const {role} = useSelector(
    (state: RootState) => state.user
  );

  const isMenuHandlingPage = (id === "0");

  const selectedCategory = beverageCategory.selectedCategory;
  
  const { loading, error } = beverageCategory.fetchAllExtraBeverageCategoriesStatus; 
  
  const categories = Object.values(BeverageCategories);

  const extraCategories = beverageCategory.extraCategories;

  const isExtraBeverageCategory =
              selectedCategory !== BeverageCategories.HARD_LIQUOR.value &&
              selectedCategory !== BeverageCategories.SOFT_DRINKS.value;

  const isAdminRole = (role === "Beach-Restaurant-Admin") || (role === "Pool-Restaurant-Admin") ;
  

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedIndex = categories.findIndex(
    (cat) => cat.value === selectedCategory
  );

  useEffect(() => {
     dispatch(setSelectedCategory(""))
     dispatch(setIsBeverageItemsList(false));
     dispatch(fetchAllExtraBeverageCategories());
  }, []);

  // show error toast
  useEffect(() => {
    if (error) {
      toast.error("Failed to load beverage categories. Please try again.");
    }
  }, [error]);

  // Ensure selected item is visible when it changes
  useEffect(() => {
    if (selectedIndex >= 0) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  const handleClick = (category: string) => {
    dispatch(setIsFoodCategory(false));
    dispatch(setSelectedCategory(category));
    dispatch(setSelectedCategoryId(""));
    dispatch(setIsBeverageItemsList(true));
    dispatch(setSelectedFoodCategoryTitle(""));
    dispatch(setSelectedBeverageCategoryTitle(category));
    dispatch(setIsFoodCategory(false));
    dispatch(setIsClickAddNewFoodItem(true));

    dispatch(setSelectedBeverageItem(""));
    dispatch(setSelectedExtraBeverageItem(""));
    dispatch(setSelectedFoodItem(""));
  };

  const handleAddNewBeverageCategory = () => {
    dispatch(setIsClickedAddFoodCategory(true));
    dispatch(setIsFoodCategory(false));
    dispatch(setIsClickAddNewFoodItem(false));
  }

  const handleUpdateBeverageCategory = () => {
    dispatch(setIsClickedUpdateFoodCategory(true));
    dispatch(setIsClickedAddFoodCategory(false));
    dispatch(setIsClickAddNewFoodItem(false));
  };

  return (
    <div className="relative flex flex-col items-start w-11/12 rounded-md">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[72px] w-full mb-2 rounded-md" />
        ))
      ) : (
        <div className="w-full h-[calc(100vh-300px)] overflow-y-auto no-scrollbar">
          {categories.map((cat, index) => {
            const isSelected = cat.value === selectedCategory;
            return (
              <div
                key={cat.value}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onClick={() => handleClick(cat.value)}
                className={`px-4 py-6 mb-2 w-full max-h-[72px] flex items-center justify-center text-[0.95rem] text-center font-semibold cursor-pointer rounded-md
                  ${
                    isSelected
                      ? "bg-[#B24E0E] text-white"
                      : "bg-transparent text-[#5B5B5B] border border-[#CECECE]"
                  }`}
              >
                {cat.label.toUpperCase()}
              </div>
            );
          })}

          {extraCategories.map((cat, index) => {
            const isSelected = cat._id === selectedCategory;
            return (
              <div
                key={cat._id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onClick={() => handleClick(cat._id)}
                className={`px-4 py-6 mb-2 w-full max-h-[72px] flex items-center justify-center text-[0.95rem] text-center font-semibold cursor-pointer rounded-md
                  ${
                    isSelected
                      ? "bg-[#B24E0E] text-white"
                      : "bg-transparent text-[#5B5B5B] border border-[#CECECE]"
                  }`}
              >
                {cat.name.toUpperCase()}
              </div>
            );
          })}
        </div>
      )}
      {( isMenuHandlingPage && isAdminRole ) && (
        <div className="w-full flex gap-2">
          <div className="sticky left-0 bottom-5 w-[47%] pr-1 bg-white">
            <div
              className="py-5 w-full flex items-center justify-center border rounded-sm cursor-pointer"
              onClick={handleAddNewBeverageCategory}
            >
              <Plus size={24} className="text-[#0A869D]" />
            </div>
          </div>

          <div
            className={`sticky left-0 bottom-5 w-[48%] pr-1 bg-white ${
              foodCategory.isFoodCategory || (!isExtraBeverageCategory)
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <div
              className="py-5 w-full flex items-center justify-center border rounded-sm"
              onClick={
                !foodCategory.isFoodCategory
                  ? handleUpdateBeverageCategory
                  : undefined
              }
            >
              <Edit size={24} className="text-[#0A869D]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeverageCategorySelector;
