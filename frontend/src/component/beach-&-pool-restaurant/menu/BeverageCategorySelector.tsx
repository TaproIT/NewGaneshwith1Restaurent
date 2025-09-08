import { fetchAllBeverageCategories } from "@/api/order/get-beverage-categories-api";
import type { RootState } from "@/app/store";
import { setCategoryId, setIsBeverageItemsList } from "@/features/beach-restaurant/beverageCategorySlice";
import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const staticBeverageCategories = [
  { _id: "1", categoryName: "Soft Drinks" },
  { _id: "2", categoryName: "Juices" },
  { _id: "3", categoryName: "Mocktails" },
  { _id: "4", categoryName: "Cocktails" },
  { _id: "5", categoryName: "Beers" },
  { _id: "6", categoryName: "Mocktails" },
  { _id: "7", categoryName: "Cocktails" },
  { _id: "8", categoryName: "Beers" },
  { _id: "9", categoryName: "Mocktails" },
  { _id: "10", categoryName: "Cocktails" },
  { _id: "11", categoryName: "Beers" },
];

const BeverageCategorySelector: React.FC = () => {
  const dispatch = useDispatch();
  const beverageCategory = useSelector(
    (state: RootState) => state.beverageCategory
  );

  const categories = beverageCategory.categories;
  const selectedCategoryId = beverageCategory.selectedCategoryId;

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedIndex = categories.findIndex(
    (cat) => cat._id === selectedCategoryId
  );

  useEffect(() => {
    dispatch(fetchAllBeverageCategories() as any);
  }, [dispatch]);

  //Auto select first category if none selected
  // useEffect(() => {
  //   if (!selectedCategoryId && categories.length > 0) {
  //     dispatch(setBeverageCategoryId(categories[0]._id));
  //   }
  // }, [categories, selectedCategoryId, dispatch]);

  // Ensure selected item is visible when it changes
  useEffect(() => {
    if (selectedIndex >= 0) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  const handleClick = (index: number) => {
    //dispatch(setCategoryId(categories[index]._id));
    dispatch(setIsBeverageItemsList(true));
  };

  return (
    <div className="flex flex-col items-start w-[135px] h-[calc(100vh-250px)] overflow-y-auto no-scrollbar rounded-md">
      {staticBeverageCategories.map((cat, index) => {
        const isSelected = cat._id === selectedCategoryId;
        return (
          <div
            key={cat._id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            onClick={() => handleClick(index)}
            className={`px-4 py-6 mb-2 w-full flex items-center justify-center text-sm font-medium cursor-pointer rounded-md
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
  );
};

export default BeverageCategorySelector;
