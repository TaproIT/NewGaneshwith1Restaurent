import { fetchAllFoodCategories } from "@/api/order/get-food-categories-api";
import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { setCategoryId } from "@/features/beach-restaurant/foodCategorySlice";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const CategorySelector: React.FC = () => {
  const dispatch = useDispatch();

  const foodCategory = useSelector(
    (state: RootState) => state.foodCategory
  );

  const categories = foodCategory.categories;
  //console.log(categories);
  const selectedCategoryId = foodCategory.selectedCategoryId;

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedIndex = categories.findIndex(
    (cat) => cat._id === selectedCategoryId
  );
  
  useEffect( () => {
    dispatch(fetchAllFoodCategories() as any);
  },[dispatch]);

  // Auto select first category if none selected
  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      dispatch(setCategoryId(categories[0]._id));
    }
  }, [categories, selectedCategoryId, dispatch]);

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
    dispatch(setCategoryId(categories[index]._id));
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      dispatch(setCategoryId(categories[selectedIndex - 1]._id));
    }
  };

  const handleNext = () => {
    if (selectedIndex < categories.length - 1) {
      dispatch(setCategoryId(categories[selectedIndex + 1]._id));
    }
  };

  return (
    <div className="flex items-center w-full">
      {/* Left arrow */}
      <Button
        onClick={handlePrev}
        variant="outline"
        size="sm"
        disabled={selectedIndex <= 0}
        className="cursor-pointer"
      >
        <ChevronLeft size={20} />
      </Button>

      {/* Scrollable Categories */}
      <ScrollArea className="w-[90%] whitespace-nowrap">
        <div className="flex gap-1">
          {categories.map((cat, index) => {
            const isSelected = cat._id === selectedCategoryId;
            return (
              <div
                key={cat._id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onClick={() => handleClick(index)}
                className={`px-4 py-2 w-[123px] 2xl:w-[163px] flex items-center justify-center text-[0.75rem] font-medium cursor-pointer rounded-md
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
      </ScrollArea>

      {/* Right arrow */}
      <Button
        onClick={handleNext}
        variant="outline"
        size="sm"
        disabled={selectedIndex === categories.length - 1}
        className="cursor-pointer"
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );
};

export default CategorySelector;
