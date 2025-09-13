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
    quantity: 0,
    note: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value, // ensure quantity is number
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      action,
    };
    setIsLoading(true);

    try {
      await api.patch(`/beverages/${selectedBeverage}`, payload); // adjust endpoint if needed
      {
        action === "restock"
          ? toast.success("Beverage updated successfully")
          : toast.success("Beverage removed successfully");
      }

      onOpenChange(false); // close modal
      setForm({ action: "", quantity: 0, note: "" }); // reset
      setIsLoading(false);
    } catch (error: any) {
      if (error.response?.data) {
        const message =
          error.response.data.message || "Failed to update beverage";
        toast.error(message);
        setForm({ action: "", quantity: 0, note: "" });
        setIsLoading(false);
      } else {
        toast.error("Something went wrong. Please try again.");
        setForm({ action: "", quantity: 0, note: "" });
        setIsLoading(false);
      }
      console.error("Backend error:", error);
    }
  };

  console.log(action);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {action === "restock" ? (
            <DialogTitle>Restock Beverage</DialogTitle>
          ) : (
            <DialogTitle>Remove Beverage</DialogTitle>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity || ""}
            onChange={handleChange}
          />

          <Input
            type="text"
            name="note"
            placeholder="Note (optional)"
            value={form.note}
            onChange={handleChange}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>
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
