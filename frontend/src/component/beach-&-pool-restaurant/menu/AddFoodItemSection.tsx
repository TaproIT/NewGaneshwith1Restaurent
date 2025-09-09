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

export default function AddFoodItemSection() {
  const [addLiqueur, setAddLiqueur] = useState(false);
  const [liqueurs, setLiqueurs] = useState<{ name: string; amount: string }[]>(
    []
  );

  // Show at least one field when toggle is enabled
  const handleToggleLiqueur = (checked: boolean) => {
    setAddLiqueur(checked);
    if (checked && liqueurs.length === 0) {
      setLiqueurs([{ name: "", amount: "" }]);
    }
    if (!checked) {
      setLiqueurs([]);
    }
  };

  const handleAddLiqueur = () => {
    setLiqueurs([...liqueurs, { name: "", amount: "" }]);
  };

  const handleRemoveLiqueur = (index: number) => {
    const updated = [...liqueurs];
    updated.splice(index, 1);
    setLiqueurs(updated);
  };

  return (
    <div className="max-w-sm h-full text-[#444444] mx-auto p-4 flex flex-col items-center justify-between bg-mainWhite rounded-l-2xl">
      <div className="w-full">
        <p className="text-[1rem] font-[500] mb-4">Add Item</p>

        {/* Item Type */}
        <div className="grid grid-cols-3 mb-3 items-center">
          <Label className="col-span-1 text-[0.75rem]">Item Type :</Label>
          <Select>
            <SelectTrigger className="col-span-2 w-full text-[0.75rem]">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="text-[0.75rem]">
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="beverage">Beverage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="grid grid-cols-3 mb-3 items-center">
          <Label className="col-span-1 text-[0.75rem]">Category :</Label>
          <Select>
            <SelectTrigger className="col-span-2 w-full text-[0.75rem]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="text-[0.75rem]">
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Item Name */}
        <div className="grid grid-cols-3 mb-3">
          <Label className="col-span-1 text-[0.75rem]">Item Name :</Label>
          <Input
            placeholder="Item Name"
            className="col-span-2 text-[0.75rem] placeholder:text-[0.75rem]"
          />
        </div>

        {/* Price */}
        <div className="grid grid-cols-3 mb-3">
          <Label className="col-span-1 text-[0.75rem]">Price :</Label>
          <Input
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
                      <Select>
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
                        placeholder="Amount of Liqueur"
                        className="text-[0.75rem] placeholder:text-[0.75rem]"
                      />
                    </div>

                    {/* Remove button bottom-right */}
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
      <Button className="w-full bg-teal-600 hover:bg-teal-700">Add</Button>
    </div>
  );
}
