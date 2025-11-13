"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { BeverageCategories } from "@/lib/enums/order-related-enums";
import { toast } from "react-toastify";

// import { updateFoodItem } from "@/api/order/update-food-item-api";
// import { updateBeverageItem } from "@/api/order/update-beverage-api";
// import { updateExtraBeverageItem } from "@/api/order/update-extra-beverage-api";
import { fetchAllBeverageItems } from "@/api/order/get-beverage-list-api";
import { fetchAllExtraBeverageCategories } from "@/api/order/get-extra-beverge-categories-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateFoodItem } from "@/api/order/update-food-item-api";

type Liqueur = { beverage: string; amount: number };


export default function UpdateItemSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { isFoodCategory, selectedFoodCategoryTitle } = useSelector(
    (state: RootState) => state.foodCategory
  );
  const { selectedFoodItem, isUpdatedFoodItem, fetchAllFoodItemsStatus } = useSelector(
    (state: RootState) => state.food
  );
   const { selectedCategory, selectedBeverageCategoryTitle, fetchAllExtraBeverageCategoriesStatus } = useSelector(
    (state: RootState) => state.beverageCategory
  );
  const { beverageItems: beverages, selectedBeverageItem, selectedExtraBeverageItem, fetchAllExtraBeverageItemsStatus } = useSelector(
    (state: RootState) => state.beverage
  );
  const hardLiquors = beverages.filter(
    (b) => b.category === BeverageCategories.HARD_LIQUOR.value
  );

  const isExtraBeverageCategory =
          selectedCategory !== BeverageCategories.HARD_LIQUOR.value &&
          selectedCategory !== BeverageCategories.SOFT_DRINKS.value;

  const updateFoodItemLoading = fetchAllFoodItemsStatus.loading;

  const updateExtraBeverageItemLoading = fetchAllExtraBeverageItemsStatus.loading;

  const updateExtraBeverageCategoriesLoading = fetchAllExtraBeverageCategoriesStatus.loading;

  // States
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [addLiqueur, setAddLiqueur] = useState(false);
  const [liqueurs, setLiqueurs] = useState<Liqueur[]>([]);

  const isDisabled = !itemName.trim() || price <= 0;

  const handleToggleLiqueur = (checked: boolean) => {
    setAddLiqueur(checked);
    setLiqueurs(checked ? [{ beverage: "", amount: 0 }] : []);
  };

  const handleAddLiqueur = () =>
    setLiqueurs((prev) => [...prev, { beverage: "", amount: 0 }]);

  const handleRemoveLiqueur = (index: number) =>
    setLiqueurs((prev) => prev.filter((_, i) => i !== index));

  const handleUpdateItem = async () => {
    try {
      if (selectedFoodItem !== null) {
        const updatedItem = {
          foodId: selectedFoodItem._id,
          itemName,
          price,
          category: selectedFoodItem?.category,
          isEnableBeverage: addLiqueur,
          liquor: addLiqueur
            ? liqueurs.map((l) => ({
                beverage: l.beverage,
                amount: l.amount ?? 0,
              }))
            : [],
        };

        dispatch(updateFoodItem(updatedItem));
      }

      if (selectedExtraBeverageItem !== null) {
        const updatedItem = {
          beverageId: selectedExtraBeverageItem._id,
          beverageName: itemName,
          price,
          extraBeverageCategory: selectedExtraBeverageItem?.category,
          isEnableBeverage: addLiqueur,
          liquor: addLiqueur
            ? liqueurs.map((l) => ({
                beverage: l.beverage,
                amount: l.amount ?? 0,
              }))
            : [],
        };

        dispatch(updateExtraBeverage(updatedItem));
      }

      toast.success("Item updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update item");
    }
  };

  const handleDeleteItem = async () => {
    try {
      if (selectedFoodItem !== null) {
         dispatch(deleteFoodItem({foodId:selectedFoodItem._id}));
      }

      if (selectedExtraBeverageItem !== null) {
        dispatch(deleteExtraBeverageItem({beverageId:selectedExtraBeverageItem._id}))
      }

      toast.success("Item deleted successfully!");
      dispatch(setIsClickAddNewFoodItem(true));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete item");
    }
  }

  // Fetch data once
  useEffect(() => {
    dispatch(fetchAllBeverageItems());
    dispatch(fetchAllExtraBeverageCategories());
  }, [dispatch]);
  
  useEffect(() => {
  if (selectedFoodItem !== null) {
    setItemName(selectedFoodItem.itemName || "");
    setPrice(selectedFoodItem.price || 0);
    setAddLiqueur(selectedFoodItem.isEnableBeverage || false);
    setLiqueurs(selectedFoodItem.liquor ?? []);
    return;
  }

  // if (selectedBeverageItem !== null) {
  //   setItemName(selectedBeverageItem.beverageName || "");
  //   setPrice(selectedBeverageItem.price || 0);
  //   return;
  // }

   if (selectedExtraBeverageItem !== null) {
    setItemName(selectedExtraBeverageItem.beverageName || "");
    setPrice(selectedExtraBeverageItem.price || 0);
    setAddLiqueur(selectedExtraBeverageItem.isEnableBeverage || false);
    setLiqueurs(selectedExtraBeverageItem.liquor ?? []);
    return;
  }
}, [selectedFoodItem, selectedBeverageItem, selectedExtraBeverageItem, isUpdatedFoodItem]);

  if ( updateFoodItemLoading || updateExtraBeverageItemLoading || updateExtraBeverageCategoriesLoading) {
    return (
      <UpdateItemSkeleton />
    )
  }

  return (
    <div className="max-w-sm h-full text-[#444444] mx-auto p-4 flex flex-col items-center justify-between bg-mainWhite rounded-l-2xl">
      <div className="w-full">
        <p className="text-[1rem] font-[500] mb-4">Update Item</p>

        {/* Item Type */}
        <FormRow label="Item Type :">
          <div className="text-[0.85rem] font-semibold">
            {selectedFoodCategoryTitle ? "Food" : "Beverage"}
          </div>
        </FormRow>

        {/* Category */}
        <FormRow label="Category :">
          <div className="text-[0.85rem] font-semibold">
            {selectedFoodCategoryTitle
              ? selectedFoodCategoryTitle
              : selectedBeverageCategoryTitle}
          </div>
        </FormRow>
        {/* Item Name */}
        <FormRow label="Item Name :">
          <Input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item Name"
            className="!text-[0.75rem] placeholder:text-[0.75rem]"
          />
        </FormRow>

        {/* Price */}
        <FormRow label="Price :">
          <Input
            type="number"
            min={0}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="LKR 0.00"
            className="!text-[0.75rem] placeholder:text-[0.75rem]"
          />
        </FormRow>

        {/* Add Liqueur */}
        {(isFoodCategory || isExtraBeverageCategory) && (
          <div className="mt-5 flex items-center mb-3">
            <Label className="w-24 text-[0.75rem]">Add Liqueur</Label>
            <Switch
              checked={addLiqueur}
              onCheckedChange={handleToggleLiqueur}
              className="cursor-pointer"
            />
          </div>
        )}

        {/* Liqueur Section */}
        {addLiqueur && (
          <ScrollArea className="w-full h-[calc(100vh-500px)]">
            <Card className="mb-2">
              <CardContent className="p-3 space-y-3">
                {liqueurs.map((liq, index) => (
                  <div key={index} className="relative border-b pb-6 mb-3">
                    <FormRow label="Liqueur :">
                      <Select
                        value={liq.beverage}
                        onValueChange={(val) =>
                          setLiqueurs((prev) =>
                            prev.map((l, i) =>
                              i === index ? { ...l, beverage: val } : l
                            )
                          )
                        }
                      >
                        <SelectTrigger className="w-full text-[0.75rem] cursor-pointer">
                          <SelectValue placeholder="Select Name" />
                        </SelectTrigger>
                        <SelectContent className="text-[0.75rem]">
                          {hardLiquors.map((liquor) => (
                            <SelectItem
                              key={liquor._id}
                              value={liquor._id}
                              className="text-[0.75rem] cursor-pointer"
                            >
                              {liquor.beverageName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormRow>

                    <FormRow label="Amount :">
                      <Input
                        min={0}
                        type="number"
                        value={liq.amount || ""}
                        onChange={(e) =>
                          setLiqueurs((prev) =>
                            prev.map((l, i) =>
                              i === index
                                ? { ...l, amount: Number(e.target.value) }
                                : l
                            )
                          )
                        }
                        placeholder="Amount of Liqueur"
                        className="text-[0.75rem] placeholder:text-[0.75rem]"
                      />
                    </FormRow>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-1 right-1 h-6 w-6 cursor-pointer"
                      onClick={() => handleRemoveLiqueur(index)}
                    >
                      <Trash2 className="mt-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex justify-center">
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddLiqueur}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        )}
      </div>

      {/* Update Button */}
      <div className="mb-2 w-full flex flex-col justify-end gap-2">
        <Button
          className="w-full bg-primary hover:bg-primary cursor-pointer"
          disabled={isDisabled}
          onClick={handleUpdateItem}
        >
          Update
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
    </div>
  );
}

/* Reusable FormRow */
function FormRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 mb-3 items-center">
      <Label className="col-span-1 text-[0.75rem]">{label}</Label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { updateExtraBeverage } from "@/api/order/update-extra-beverage-item-api";
import { deleteFoodItem } from "@/api/order/delete-food-item-api";
import { deleteExtraBeverageItem } from "@/api/order/delete-extra-beverage-api";
import { setIsClickAddNewFoodItem } from "@/features/beach-restaurant/foodSlice";

function UpdateItemSkeleton() {
  return (
    <div className="max-w-sm h-full text-[#444444] mx-auto p-4 flex flex-col items-center justify-between bg-mainWhite rounded-l-2xl">
      <div className="w-full space-y-4">
        {/* Header */}
        <Skeleton className="h-5 w-32" />

        {/* Item Type */}
        <div className="grid grid-cols-3 items-center mb-2">
          <Skeleton className="h-4 w-20 col-span-1" />
          <Skeleton className="h-4 w-24 col-span-2" />
        </div>

        {/* Category */}
        <div className="grid grid-cols-3 items-center mb-2">
          <Skeleton className="h-4 w-20 col-span-1" />
          <Skeleton className="h-4 w-28 col-span-2" />
        </div>

        {/* Item Name */}
        <div className="grid grid-cols-3 items-center mb-2">
          <Skeleton className="h-4 w-20 col-span-1" />
          <Skeleton className="h-8 w-full col-span-2" />
        </div>

        {/* Price */}
        <div className="grid grid-cols-3 items-center mb-2">
          <Skeleton className="h-4 w-20 col-span-1" />
          <Skeleton className="h-8 w-full col-span-2" />
        </div>

        {/* Add Liqueur Toggle */}
        <div className="mt-8 flex items-center mb-3">
          <Skeleton className="h-4 w-20 mr-2" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>

        {/* Liqueur Section (Simulated) */}
        <Card className="mb-3">
          <CardContent className="p-3 space-y-4">
            {[1, 2].map((_, index) => (
              <div key={index} className="relative border-b pb-4 mb-2">
                <div className="grid grid-cols-3 items-center mb-2">
                  <Skeleton className="h-4 w-20 col-span-1" />
                  <Skeleton className="h-8 w-full col-span-2" />
                </div>
                <div className="grid grid-cols-3 items-center mb-2">
                  <Skeleton className="h-4 w-20 col-span-1" />
                  <Skeleton className="h-8 w-full col-span-2" />
                </div>
              </div>
            ))}

            <div className="flex justify-center">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Button */}
      <Skeleton className="h-10 w-full mt-4 rounded-md" />
    </div>
  );
}

