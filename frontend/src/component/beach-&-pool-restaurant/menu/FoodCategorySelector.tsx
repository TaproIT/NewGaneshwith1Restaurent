import { fetchAllFoodCategories } from "@/api/order/get-food-categories-api";
import type { RootState } from "@/app/store";
import {
  setSelectedCategory,
  setIsBeverageItemsList,
} from "@/features/beach-restaurant/beverageCategorySlice";
import { setIsClickedAddFoodCategory, setIsClickedUpdateFoodCategory, setIsFoodCategory, setSelectedCategoryId, setSelectedFoodCategoryTitle } from "@/features/beach-restaurant/foodCategorySlice";
import { setIsClickAddNewFoodItem, setSelectedFoodItem } from "@/features/beach-restaurant/foodSlice";
import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { Edit, Plus } from "lucide-react";
import { setSelectedBeverageItem, setSelectedExtraBeverageItem } from "@/features/beach-restaurant/beverageSlice";

const FoodCategorySelector: React.FC<{id:string}> = ({id}) => {
  const dispatch = useDispatch();
  const foodCategory = useSelector((state: RootState) => state.foodCategory);
  const { role } = useSelector(
    (state: RootState) => state.user
  );

  const isMenuHandlingPage = (id === "0");

  const categories = foodCategory.categories;
  const selectedCategoryId = foodCategory.selectedCategoryId;
  const { loading, error } = foodCategory.fetchAllFoodCategoriesStatus;

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // drag-to-scroll states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const isAdminRole = (role === "Beach-Restaurant-Admin") || (role === "Pool-Restaurant-Admin") ;

  const selectedIndex = categories.findIndex(
    (cat) => cat._id === selectedCategoryId
  );

  useEffect(() => {
    dispatch(fetchAllFoodCategories() as any);
  }, [dispatch]);

  // Set first category title when categories are loaded
useEffect(() => {
  if (categories.length > 0) {
    dispatch(setSelectedFoodCategoryTitle(categories[0]._id));
  }
}, [categories, dispatch]);

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
    dispatch(setIsFoodCategory(true));
    dispatch(setSelectedCategory(""));
    dispatch(setSelectedCategoryId(categories[index]._id));
    dispatch(setIsBeverageItemsList(false));
    dispatch(setSelectedFoodCategoryTitle(categories[index]._id))
    dispatch(setIsClickAddNewFoodItem(true));

    dispatch(setSelectedBeverageItem(""));
    dispatch(setSelectedExtraBeverageItem(""));
    dispatch(setSelectedFoodItem(""));
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

  const handleAddNewFoodCategory = () => {
    dispatch(setIsClickedAddFoodCategory(true));
    dispatch(setIsFoodCategory(true));
    dispatch(setIsClickAddNewFoodItem(false));
  }

  const handleUpdateFoodCategory = () => {
     dispatch(setIsFoodCategory(true));
     dispatch(setIsClickedUpdateFoodCategory(true));
     dispatch(setIsClickedAddFoodCategory(false));
     dispatch(setIsClickAddNewFoodItem(false));
  }

  return (
    <div className="relative flex flex-col items-start w-full">
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-2.5 overflow-x-auto cursor-grab active:cursor-grabbing no-scrollbar ${isMenuHandlingPage ? isAdminRole ? "w-[81.5%]": "w-full" : "w-full"}`}
      >
        {loading
          ? // Show skeletons while loading
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className="px-4 py-8 w-[140px] 2xl:w-[163px] rounded-md"
              />
            ))
          : categories.map((cat, index) => {
              const isSelected = cat._id === selectedCategoryId;
              return (
                <>
                  <div
                    key={cat._id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    onClick={() => handleClick(index)}
                    className={`relative px-4 py-4 w-[22%] min-h-[70px]  max-h-[70px] flex-shrink-0 flex items-center justify-center text-[0.95rem] text-center font-semibold cursor-pointer rounded-md
                ${
                  isSelected
                    ? "bg-secondary text-white"
                    : "bg-transparent text-[#E37E0A] border border-[#CECECE]"
                }`}
                  >
                    {cat.categoryName.toUpperCase()}
                  </div>
                  {/* {isMenuHandlingPage && (
                    <div className="" onClick={handleUpdateFoodCategory}>
                      <Edit2 size={22} />
                    </div>
                  )} */}
                </>
              );
            })}
      </div>
      {/* Add New Category Button (fixed to right) */}
      {(isMenuHandlingPage && isAdminRole) && (
        <div className="w-[20%] grid grid-cols-2 gap-0.25 absolute right-[0%] top-1/2 -translate-y-1/2">
          <div className=" col-span-1 pr-1 bg-primary rounded-l-lg">
            <div
              className="py-5 px-2 flex items-center justify-center gap-1 rounded-sm cursor-pointer text-white text-[0.9rem]"
              onClick={handleAddNewFoodCategory}
            >
              <Plus size={20} />
              Add
            </div>
          </div>

          <div
            className={`col-span-1 pr-1 bg-primary rounded-r-lg ${
              !foodCategory.isFoodCategory
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <div
              className="py-5.5 px-2 flex items-center justify-center gap-2 rounded-sm text-white text-[0.9rem]"
              onClick={
                foodCategory.isFoodCategory
                  ? handleUpdateFoodCategory
                  : undefined
              }
            > 
              <Edit size={18} />
              Edit
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodCategorySelector;
