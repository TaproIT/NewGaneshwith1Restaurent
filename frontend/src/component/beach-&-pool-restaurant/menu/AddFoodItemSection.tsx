"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { BeverageCategories } from "@/lib/enums/order-related-enums";
import type { BeverageItem } from "../beverage-model";
import { addNewBeverage } from "@/api/order/add-beverage-api";
import { addNewFoodItem } from "@/api/order/add-food-item-api";
import { fetchAllBeverageItems } from "@/api/order/get-beverage-list-api";
import { toast } from "react-toastify";
import { setIsBeverageItemsList, setSelectedCategory } from "@/features/beach-restaurant/beverageCategorySlice";
import { setSelectedCategoryId } from "@/features/beach-restaurant/foodCategorySlice";

type Liqueur = { beverage: string; amount: number };

export default function AddFoodItemSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories: foodCategories } = useSelector(
    (state: RootState) => state.foodCategory
  );
  const { addFoodItemStatus } = useSelector(
    (state: RootState) => state.food
  );
  const { beverageItems: beverages } = useSelector(
    (state: RootState) => state.beverage
  );
  const { addBeverageItemStatus } = useSelector(
    (state: RootState) => state.beverage
  );

  const beverageCategories = Object.values(BeverageCategories);
  const hardLiquors = beverages.filter(
    (b) => b.category === BeverageCategories.HARD_LIQUOR.value
  );

  // Form states
  const [itemType, setItemType] = useState<"food" | "beverage" | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState<number>(0);

  // Liqueur states
  const [addLiqueur, setAddLiqueur] = useState(false);
  const [liqueurs, setLiqueurs] = useState<Liqueur[]>([]);

  const isDisabled =
    !itemType || !category || !itemName.trim() || price <= 0;

  const resetForm = () => {
    setItemType(null);
    setCategory(null);
    setItemName("");
    setPrice(0);
    setAddLiqueur(false);
    setLiqueurs([]);
  };

  const handleToggleLiqueur = (checked: boolean) => {
    setAddLiqueur(checked);
    setLiqueurs(checked ? [{ beverage: "", amount: 0 }] : []);
  };

  const handleAddLiqueur = () =>
    setLiqueurs((prev) => [...prev, { beverage: "", amount: 0 }]);

  const handleRemoveLiqueur = (index: number) =>
    setLiqueurs((prev) => prev.filter((_, i) => i !== index));

  const handleAddItem = async () => {
    try {
      if (itemType === "food") {
        const foodItem = {
          itemName,
          price,
          isVisible: true,
          category,
          isEnableBeverage: addLiqueur,
          liquor: liqueurs,
        };

        await dispatch(addNewFoodItem(foodItem)).unwrap(); 
        toast.success("Food item added successfully!");

        // Reset form and update state
        dispatch(setIsBeverageItemsList(false));
        dispatch(setSelectedCategoryId(category ?? ""));
        dispatch(setSelectedCategory(""));
      } else {
        const beverageItem = {
          category,
          beverageName: itemName,
          price,
          isVisible: true,
          initialStock: 10,
          note: "",
        };

        await dispatch(addNewBeverage(beverageItem)).unwrap();
        toast.success("Beverage item added successfully!");

        dispatch(setIsBeverageItemsList(true));
        dispatch(setSelectedCategory(category ?? ""));
        dispatch(setSelectedCategoryId(""));
      }

      resetForm();
    } catch (err: any) {
      //handle error directly
      if (itemType==="food") {
          toast.error(addFoodItemStatus.error || "Failed to add food item");
          return;
      }
         toast.error(addBeverageItemStatus.error || "Failed to add beverage item");
    }
  };


   // fetch beverages
  useEffect(() => {
    dispatch(fetchAllBeverageItems());
  }, [dispatch]);


  return (
    <div className="max-w-sm h-full text-[#444444] mx-auto p-4 flex flex-col items-center justify-between bg-mainWhite rounded-l-2xl">
      <div className="w-full">
        <p className="text-[1rem] font-[500] mb-4">Add Item</p>

        {/* Item Type */}
        <FormRow label="Item Type :">
          <Select
            value={itemType ?? ""}
            onValueChange={(val) => {
              setItemType(val as "food" | "beverage");
              setCategory(null);
            }}
          >
            <SelectTrigger className="w-full text-[0.75rem] cursor-pointer">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food" className="text-[0.75rem] cursor-pointer">
                Food
              </SelectItem>
              <SelectItem value="beverage" className="text-[0.75rem] cursor-pointer">
                Beverage
              </SelectItem>
            </SelectContent>
          </Select>
        </FormRow>

        {/* Category */}
        <FormRow label="Category :">
          <Select
            value={category ?? ""}
            onValueChange={setCategory}
            disabled={!itemType}
          >
            <SelectTrigger className="w-full text-[0.75rem] cursor-pointer">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="text-[0.75rem]">
              {itemType === "food"
                ? foodCategories.map((cat) => (
                    <SelectItem
                      key={cat._id}
                      value={cat._id}
                      className="text-[0.75rem] cursor-pointer"
                    >
                      {cat.categoryName}
                    </SelectItem>
                  ))
                : beverageCategories.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className="text-[0.75rem]"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </FormRow>

        {/* Item Name */}
        <FormRow label="Item Name :">
          <Input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            disabled={!itemType}
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
            disabled={!itemType}
            placeholder="LKR 0.00"
            className="!text-[0.75rem] placeholder:text-[0.75rem]"
          />
        </FormRow>

        {/* Add Liqueur Switch */}
        {
          itemType === "food" && (
            <div className="mt-10 flex items-center mb-3">
              <Label className="w-24 text-[0.75rem]">Add Liqueur</Label>
              <Switch checked={addLiqueur} onCheckedChange={handleToggleLiqueur} className="cursor-pointer" />
            </div>
          )
        }

        {/* Liqueur Section */}
        {addLiqueur && (
          <ScrollArea className="w-full h-[calc(100vh-500px)]">
            <Card className="mb-3">
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

      {/* Add Button */}
      <Button
        className="w-full bg-primary hover:bg-primary cursor-pointer"
        disabled={isDisabled}
        onClick={handleAddItem}
      >
        Add
      </Button>
    </div>
  );
}

/* Reusable FormRow component */
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
