import { fetchAllFoodCategories } from "@/api/order/get-food-categories-api";
import type { RootState } from "@/app/store";
import {
  setSelectedCategory,
  setIsBeverageItemsList,
} from "@/features/beach-restaurant/beverageCategorySlice";
import { setSelectedCategoryId } from "@/features/beach-restaurant/foodCategorySlice";
import { setIsClickAddNewFoodItem } from "@/features/beach-restaurant/foodSlice";
import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";

const FoodCategorySelector: React.FC = () => {
  const dispatch = useDispatch();
  const foodCategory = useSelector((state: RootState) => state.foodCategory);
  // const { selectedCategory } = useSelector(
  //   (state: RootState) => state.beverageCategory
  // );

  const categories = foodCategory.categories;
  const selectedCategoryId = foodCategory.selectedCategoryId;
  const { loading, error } = foodCategory.fetchAllFoodCategoriesStatus;

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // drag-to-scroll states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const selectedIndex = categories.findIndex(
    (cat) => cat._id === selectedCategoryId
  );

  useEffect(() => {
    dispatch(fetchAllFoodCategories() as any);
  }, [dispatch]);

  // toast error handling
  useEffect(() => {
    if (error) {
      toast.error("Failed to load food categories. Please try again.");
    }
  }, [error]);
  // Auto select first category if none selected
  // useEffect(() => {
  //   if (!selectedCategoryId && !selectedCategory && categories.length > 0) {
  //     dispatch(setSelectedCategoryId(categories[0]._id));
  //   }
  // }, [categories, selectedCategoryId, dispatch]);

  // Ensure selected item is visible when it changes
  useEffect(() => {
    if (selectedIndex >= 0) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  const handleClick = (index: number) => {
    dispatch(setSelectedCategory(""));
    dispatch(setSelectedCategoryId(categories[index]._id));
    dispatch(setIsBeverageItemsList(false));
    dispatch(setIsClickAddNewFoodItem(false));
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1; // speed factor
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex gap-2 overflow-x-auto cursor-grab active:cursor-grabbing no-scrollbar w-full"
      >
        {loading
          ? // Show skeletons while loading
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className="px-4 py-8 w-[135px] 2xl:w-[163px] rounded-md"
              />
            ))
          : categories.map((cat, index) => {
              const isSelected = cat._id === selectedCategoryId;
              return (
                <div
                  key={cat._id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onClick={() => handleClick(index)}
                  className={`px-4 py-6 w-[135px] 2xl:w-[163px] flex-shrink-0 flex items-center justify-center text-[0.75rem] font-medium cursor-pointer rounded-md
                ${
                  isSelected
                    ? "bg-[#B24E0E] text-white"
                    : "bg-transparent text-[#5B5B5B] border border-[#CECECE]"
                }`}
                >
                  {cat.categoryName}
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default FoodCategorySelector;
