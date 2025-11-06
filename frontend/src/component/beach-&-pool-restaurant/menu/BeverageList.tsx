import React, { useEffect } from "react";
import { Plus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "@/app/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchAllBeverageItems } from "@/api/order/get-beverage-list-api";
import type { BeverageItem } from "../beverage-model";
import BeverageItemSelector from "./BeverageItemSelector";
import { setIsClickAddNewFoodItem } from "@/features/beach-restaurant/foodSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchAllExtraBeverageItems } from "@/api/order/get-extra-beverage-list-api";
import { BeverageCategories } from "@/lib/enums/order-related-enums";

const BeverageList: React.FC<{id:string}> = ({id}) => {
  const {
    beverageItems: beverages,
    extrabeverageItems: extraBeverages,
    isAddedBeverageItem,
    fetchAllBeverageItemsStatus,
  } = useSelector((state: RootState) => state.beverage);

  const selectedCategoryId = useSelector(
    (state: RootState) => state.beverageCategory.selectedCategory
  );

  const dispatch = useDispatch<AppDispatch>();

  const isMenuHandlingPage = (id === "0");

  const isExtraBeverageCategory =
            selectedCategoryId !== BeverageCategories.HARD_LIQUOR.value &&
            selectedCategoryId !== BeverageCategories.SOFT_DRINKS.value;
  

 const categoryBeverages = [
  ...beverages.filter(
    (beverage) => beverage.category === selectedCategoryId
  ),
  ...extraBeverages.filter(
    (beverage) => beverage.extraBeverageCategory?._id === selectedCategoryId
  ),
];

  const navigate = useNavigate();

  const { loading, error } = fetchAllBeverageItemsStatus;

  const handleAddNewFoodItem = () => {
    dispatch(setIsClickAddNewFoodItem(true));
    navigate("/restaurant/menu/0");
  };

  useEffect(() => {
    dispatch(fetchAllBeverageItems());
    dispatch(fetchAllExtraBeverageItems());
  }, [dispatch, isAddedBeverageItem]);

  // Show error toast if error exists
  useEffect(() => {
    if (error) {
      toast.error("Failed to load beverage items. Please try again.");
    }
  }, [error]);

  return (
    <ScrollArea className="w-full h-[calc(100vh-250px)]">
      <div className="grid grid-cols-3 gap-1">
        {/* Add new beverage item */}
        { (isMenuHandlingPage &&  isExtraBeverageCategory) && (
          <div
            className="py-8 flex items-center justify-center border rounded-sm cursor-pointer"
            onClick={handleAddNewFoodItem}
          >
            <Plus size={24} className="text-[#0A869D]" />
          </div>
        )}

        {/* Loading skeletons */}
        {loading
          ? Array.from({ length: 11 }).map((_, idx) => (
              <Skeleton key={idx} className="h-[120px] w-full rounded-sm" />
            ))
          : categoryBeverages?.map((beverage: BeverageItem) => (
              <BeverageItemSelector
                beverageItem={beverage}
                key={beverage._id}
              />
            ))}
      </div>
    </ScrollArea>
  );
};

export default BeverageList;
