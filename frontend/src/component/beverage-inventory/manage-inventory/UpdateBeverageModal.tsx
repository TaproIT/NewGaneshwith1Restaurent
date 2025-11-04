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
import { api } from "@/api/axios";
import { toast } from "react-toastify";
import type { UpdateBeverage } from "@/types/updateBeverage";

interface UpdateBeverageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBeverage: string; // beverage ID
  action: string;
}

const UpdateBeverageModal: React.FC<UpdateBeverageModalProps> = ({
  open,
  onOpenChange,
  selectedBeverage,
  action,
}) => {
  const [form, setForm] = React.useState<UpdateBeverage>({
    action: action,
    price: 0,
    quantity: 0,
    note: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Prevent negative values
    if ((name === "price" || name === "quantity") && Number(value) < 0) return;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {

    const payload = {
      ...form,
      action,
    };

    setIsLoading(true);

    try {
      // Step 1: Update beverage quantity / note
      if (form.quantity > 0 || form.note) {
      await api.patch(`/beverages/${selectedBeverage}`, payload);
      }

      // Step 2: Only update price if greater than zero
      if (form.price > 0) {
        await api.put(`/beverages/${selectedBeverage}/price`, {
          price: form.price,
        });
      }

      toast.success(
        action === "restock"
          ? "Beverage updated successfully"
          : "Beverage removed successfully"
      );

      onOpenChange(false);
      setForm({ action: "", quantity: 0, note: "", price: 0 });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update beverage";
      toast.error(message);
      console.error("Backend error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === "restock" ? "Restock Beverage" : "Remove Beverage"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <div className="grid grid-cols-3 items-center gap-2">
            <label className="col-span-1">Price</label>
            <Input
              type="number"
              name="price"
              placeholder="Price"
              value={form.price || ""}
              onChange={handleChange}
              className="col-span-2"
              min={0}
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-2">
            <label className="col-span-1">Quantity</label>
            <Input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity || ""}
              onChange={handleChange}
              className="col-span-2"
              min={1}
            />
          </div>

          <Input
            type="text"
            name="note"
            placeholder="Note (optional)"
            value={form.note}
            onChange={handleChange}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBeverageModal;
