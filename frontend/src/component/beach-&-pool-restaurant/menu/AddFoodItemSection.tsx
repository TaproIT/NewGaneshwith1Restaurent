"use client";

import { useState } from "react";
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

export default function AddFoodItemSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories: foodCategories } = useSelector(
    (state: RootState) => state.foodCategory
  );

  const beverageCategories = Object.values(BeverageCategories);

  // Form states
  const [itemType, setItemType] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState<number>(0);

  // Liqueur states
  const [addLiqueur, setAddLiqueur] = useState(false);
  const [liqueurs, setLiqueurs] = useState<{ name: string; amount: string }[]>(
    []
  );

  // Toggle liqueur section
  const handleToggleLiqueur = (checked: boolean) => {
    setAddLiqueur(checked);
    if (checked && liqueurs.length === 0) {
      setLiqueurs([{ name: "", amount: "" }]);
    }
    if (!checked) {
      setLiqueurs([]);
    }
  };

  // Add/remove liqueur fields
  const handleAddLiqueur = () => {
    setLiqueurs([...liqueurs, { name: "", amount: "" }]);
  };

  const handleRemoveLiqueur = (index: number) => {
    const updated = [...liqueurs];
    updated.splice(index, 1);
    setLiqueurs(updated);
  };

  // Handle Add button click
  const handleAddItem = () => {
    const beverageItem : BeverageItem = {
      _id: "",
      category,
      beverageName: itemName,
      price,
      isVisible: true,
      restaurantType: "",
      initialStock: 10,
      note: ""
    };

    console.log("New Item:", beverageItem);

    // Example: dispatch to redux
    dispatch(addNewBeverage(beverageItem));

    // Reset form if needed
    setItemType(null);
    setCategory(null);
    setItemName("");
    setPrice(0);
    setAddLiqueur(false);
    setLiqueurs([]);
  };

  return (
    <div className="max-w-sm h-full text-[#444444] mx-auto p-4 flex flex-col items-center justify-between bg-mainWhite rounded-l-2xl">
      <div className="w-full">
        <p className="text-[1rem] font-[500] mb-4">Add Item</p>

        {/* Item Type */}
        <div className="grid grid-cols-3 mb-3 items-center">
          <Label className="col-span-1 text-[0.75rem]">Item Type :</Label>
          <Select
            value={itemType ?? ""}
            onValueChange={(val) => {
              setItemType(val);
              setCategory(null); // reset category when type changes
            }}
          >
            <SelectTrigger className="col-span-2 w-full text-[0.75rem]">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food" className="text-[0.75rem]">
                Food
              </SelectItem>
              <SelectItem value="beverage" className="text-[0.75rem]">
                Beverage
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="grid grid-cols-3 mb-3 items-center">
          <Label className="col-span-1 text-[0.75rem]">Category :</Label>
          <Select
            value={category ?? ""}
            onValueChange={setCategory}
            disabled={!itemType}
          >
            <SelectTrigger className="col-span-2 w-full text-[0.75rem]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="text-[0.75rem]">
              {itemType === "food"
                ? foodCategories.map((cat, i) => (
                    <SelectItem
                      key={i}
                      value={cat._id}
                      className="text-[0.75rem]"
                    >
                      {cat.categoryName}
                    </SelectItem>
                  ))
                : beverageCategories.map((cat: any, i) => (
                    <SelectItem
                      key={i}
                      value={cat.value}
                      className="text-[0.75rem]"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>

        {/* Item Name */}
        <div className="grid grid-cols-3 mb-3">
          <Label className="col-span-1 text-[0.75rem]">Item Name :</Label>
          <Input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item Name"
            className="col-span-2 text-[0.75rem] placeholder:text-[0.75rem]"
          />
        </div>

        {/* Price */}
        <div className="grid grid-cols-3 mb-3">
          <Label className="col-span-1 text-[0.75rem]">Price :</Label>
          <Input
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="LKR 0.00"
            className="col-span-2 text-[0.75rem] placeholder:text-[0.75rem]"
          />
        </div>

        {/* Add Liqueur Switch */}
        <div className="mt-10 flex items-center mb-3">
          <Label className="w-24 text-[0.75rem]">Add Liqueur</Label>
          <Switch checked={addLiqueur} onCheckedChange={handleToggleLiqueur} />
        </div>

        {/* Liqueur Section */}
        {addLiqueur && (
          <ScrollArea className="w-full h-[calc(100vh-500px)]">
            <Card className="mb-3">
              <CardContent className="p-3 space-y-3">
                {liqueurs.map((liq, index) => (
                  <div key={index} className="relative border-b pb-6 mb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Label className="w-24 text-[0.75rem]">Liqueur :</Label>
                      <Select
                        value={liq.name}
                        onValueChange={(val) => {
                          const updated = [...liqueurs];
                          updated[index].name = val;
                          setLiqueurs(updated);
                        }}
                      >
                        <SelectTrigger className="w-full text-[0.75rem]">
                          <SelectValue placeholder="Select Name" />
                        </SelectTrigger>
                        <SelectContent className="text-[0.75rem]">
                          <SelectItem value="vodka">Vodka</SelectItem>
                          <SelectItem value="rum">Rum</SelectItem>
                          <SelectItem value="whiskey">Whiskey</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center">
                      <Label className="w-24 text-[0.75rem]">Amount :</Label>
                      <Input
                        value={liq.amount}
                        onChange={(e) => {
                          const updated = [...liqueurs];
                          updated[index].amount = e.target.value;
                          setLiqueurs(updated);
                        }}
                        placeholder="Amount of Liqueur"
                        className="text-[0.75rem] placeholder:text-[0.75rem]"
                      />
                    </div>

                    {/* Remove button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveLiqueur(index)}
                    >
                      <Trash2 className="mt-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex justify-center">
                  <Button
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
        className="w-full bg-teal-600 hover:bg-teal-700"
        onClick={handleAddItem}
      >
        Add
      </Button>
    </div>
  );
}
