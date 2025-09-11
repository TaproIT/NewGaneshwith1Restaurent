import { fetchAllBeverageCategories } from "@/api/order/get-beverage-categories-api";
import type { RootState } from "@/app/store";
import { setSelectedCategory, setIsBeverageItemsList } from "@/features/beach-restaurant/beverageCategorySlice";
import { setSelectedCategoryId } from "@/features/beach-restaurant/foodCategorySlice";
import { setIsClickAddNewFoodItem } from "@/features/beach-restaurant/foodSlice";
import { BeverageCategories } from "@/lib/enums/order-related-enums";
import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const BeverageCategorySelector: React.FC = () => {
  const dispatch = useDispatch();
  const beverageCategory = useSelector(
    (state: RootState) => state.beverageCategory
  );

  const selectedCategory = beverageCategory.selectedCategory;

  const categories = Object.values(BeverageCategories);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedIndex = categories.findIndex(
    (cat) => cat.value === selectedCategory
  );

  useEffect(() => {
    dispatch(fetchAllBeverageCategories() as any);
  }, [dispatch]);
  
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
    dispatch(setSelectedCategory(category));
    dispatch(setSelectedCategoryId(""));
    dispatch(setIsBeverageItemsList(true));
    dispatch(setIsClickAddNewFoodItem(false));
  };

  return (
    <div className="flex flex-col items-start w-[135px] h-[calc(100vh-250px)] overflow-y-auto no-scrollbar rounded-md">
      {categories.map((cat, index) => {
        const isSelected = cat.value === selectedCategory;
        return (
          <div
            key={cat.value}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            onClick={() => handleClick(cat.value)}
            className={`px-4 py-6 mb-2 w-full flex items-center justify-center text-[0.75rem] font-medium cursor-pointer rounded-md
              ${
                isSelected
                  ? "bg-[#B24E0E] text-white"
                  : "bg-transparent text-[#5B5B5B] border border-[#CECECE]"
              }`}
          >
            {cat.label}
          </div>
        );
      })}
    </div>
  );
};

export default BeverageCategorySelector;
