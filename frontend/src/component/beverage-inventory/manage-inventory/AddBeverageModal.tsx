"use client";

import React from "react";
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
  category
}) => {
  const [form, setForm] = React.useState<BeverageForm>({
    beverageName: "",
    price: 0,
    category: "",
    isVisible: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      initialStock: 0, // automatically set
      category: category // set from prop
    };

    console.log("Sending to backend:", payload);

    try {
    await api.post("/beverages", payload);
    toast.success("Beverage added successfully");

    onOpenChange(false); // close modal
    setForm({ beverageName: "", price: 0, category: "", isVisible: true }); // reset form
  } catch (error: any) {
    if (error.response && error.response.data) {
      // If backend sends a message
      const message = error.response.data.message || "Failed to add beverage";
      toast.error(message);
    } else {
      toast.error("Something went wrong. Please try again.");
    }
    console.error("Backend error:", error);
  }


    onOpenChange(false); // close modal
    setForm({ beverageName: "", price: 0, category: "", isVisible: true }); // reset form
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
          />
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBeverageModal;
