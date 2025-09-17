import React, { useEffect } from "react";
import { Plus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "@/app/store";
import { fetchAllFoodItems } from "@/api/order/get-food-list-api";
import type { FoodItem } from "../food-model";
import FoodItemSelector from "./FoodItemSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { setIsClickAddNewFoodItem } from "@/features/beach-restaurant/foodSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const FoodList: React.FC = () => {
  const { foodItems: foods, isAddedNewFoodItem, fetchAllFoodItemsStatus } =
    useSelector((state: RootState) => state.food);
  const selectedCategoryId = useSelector(
    (state: RootState) => state.foodCategory.selectedCategoryId
  );
  const dispatch = useDispatch<AppDispatch>();

  const categoryFoods = foods.filter(
    (food) => food.category?._id === selectedCategoryId
  );

  const navigate = useNavigate();

  const { loading, error } = fetchAllFoodItemsStatus;

  const handleAddNewFoodItem = () => {
    dispatch(setIsClickAddNewFoodItem(true));
    navigate("/beach-restaurant/menu/0");
  };

  useEffect(() => {
    dispatch(fetchAllFoodItems());
  }, [isAddedNewFoodItem]);

  // toast error handler
  useEffect(() => {
    if (error) {
      toast.error("Failed to load food items. Please try again.");
    }
  }, [error]);

  return (
    <ScrollArea className="w-full h-[calc(100vh-250px)]">
      <div className="grid grid-cols-3 gap-1">
        {/* Add new item card */}
        <div
          className="py-8 flex items-center justify-center border rounded-sm cursor-pointer hover:bg-gray-50"
          onClick={handleAddNewFoodItem}
        >
          <Plus size={24} className="text-[#0A869D]" />
        </div>

        {/* Loading state with skeletons */}
        {loading
          ? Array.from({ length: 11 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[120px] w-full rounded-sm"
              />
            ))
          : categoryFoods?.map((food: FoodItem, index) => (
              <FoodItemSelector foodItem={food} key={index} />
            ))}
      </div>
    </ScrollArea>
  );
};

export default FoodList;
