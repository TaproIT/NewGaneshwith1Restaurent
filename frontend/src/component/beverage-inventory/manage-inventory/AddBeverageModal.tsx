"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BeverageForm } from "@/types/beverageForm";
import { api } from "@/api/axios";
import { toast } from "react-toastify";

interface AddBeverageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
}

const AddBeverageModal: React.FC<AddBeverageModalProps> = ({
  open,
  onOpenChange,
  category,
}) => {
  const [form, setForm] = React.useState<BeverageForm>({
    beverageName: "",
    price: 0,
    category: "",
    note: "",
    runningStock: 0,
    volume: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if ((e.target.name === "price" || e.target.name === "runningStock" || e.target.name === "volume") && Number(e.target.value) < 0) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      initialStock: 0, // automatically set
      category: category, // set from prop
    };

    setIsLoading(true);

    try {
      await api.post("/beverages", payload);
      toast.success("Beverage added successfully");

      onOpenChange(false); // close modal
      setForm({ beverageName: "", price: 0, category: "", note: "", runningStock: 0, volume: 0 }); // reset form
      setIsLoading(false);
    } catch (error: any) {
      if (error.response && error.response.data) {
        // If backend sends a message
        const message = error.response.data.message || "Failed to add beverage";
        toast.error(message);
        setIsLoading(false);
      } else {
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      }
      console.error("Backend error:", error);
      setIsLoading(false);
    }

    onOpenChange(false); // close modal
    setForm({ beverageName: "", price: 0, category: "", note: "", runningStock: 0, volume: 0 }); // reset form
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Beverage</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Input
            type="text"
            name="beverageName"
            placeholder="Beverage Name"
            value={form.beverageName}
            onChange={handleChange}
          />

          <Input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price || ""}
            onChange={handleChange}
            min={0}
          />

          <Input
            type="number"
            name="volume"
            placeholder="Volume in ml"
            value={form.volume || ""}
            onChange={handleChange}
            min={0}
          />

          <Input
            type="number"
            name="runningStock"
            placeholder="Running Stock"
            value={form.runningStock || ""}
            onChange={handleChange}
          />

          <Input
            name="note"
            placeholder="Note (optional)"
            value={form.note || ""}
            onChange={handleChange}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBeverageModal;
